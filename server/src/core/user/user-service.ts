import { Db, Collection } from 'mongodb';
import { generateId, hashPassword, verifyPassword, generateToken } from '../util';
import { User, DbUser, UserCreateArgs, UserService, AccessToken, UserLoginArgs, UserLoginResult} from './types';
import * as messages from '../messages';
import { AppError, createDbOpFailedError, createLoginError,
  createInvalidAccessTokenError, createResourceNotFoundError,
  createUniquenessFailedError } from '../error';
import { TransactionService, TransactionCreateArgs, Transaction, InitiateDonationArgs } from '../payment';

const COLLECTION = 'users';
const TOKEN_COLLECTION = 'access_tokens';
const TOKEN_VALIDITY_MILLIS = 2 * 24 * 3600 * 1000; // 2 days

/**
 * removes fields that should
 * not be shared from the user
 * @param user 
 */
function getSafeUser(user: DbUser): User {
  const { _id, phone, createdAt, updatedAt } = user;
  return {
    _id,
    phone,
    createdAt,
    updatedAt
  };
}

export interface UsersArgs {
  transactions: TransactionService,
};

export class Users implements UserService {
  private db: Db;
  private collection: Collection<DbUser>;
  private tokenCollection: Collection<AccessToken>;
  private indexesCreated: boolean;
  private transactions: TransactionService;

  constructor(db: Db, args: UsersArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.tokenCollection = this.db.collection(TOKEN_COLLECTION);
    this.indexesCreated = false;
    this.transactions = args.transactions;
  }

  async createIndexes(): Promise<void> {
    if (this.indexesCreated) return;

    try {
      // unique phone index
      await this.collection.createIndex({ 'phone': 1 }, { unique: true, sparse: false });
      // ttl collection for access token expiry
      await this.tokenCollection.createIndex({ expiresAt: 1},
        { expireAfterSeconds: 1 });
      
      this.indexesCreated = true;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }
  
  async create(args: UserCreateArgs): Promise<User> {
    const now = new Date();
    const user = {
      _id: generateId(),
      password: await hashPassword(args.password),
      phone: args.phone,
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await this.collection.insertOne(user);
      return getSafeUser(res.ops[0]);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (e.code == 11000 && RegExp(args.phone).test(e.message)) {
        throw createUniquenessFailedError(messages.ERROR_PHONE_ALREADY_IN_USE);
      }

      throw createDbOpFailedError(e.message);
    }
  }

  async login(args: UserLoginArgs): Promise<UserLoginResult> {
    try {
      const user = await this.collection.findOne({ phone: args.phone });

      const passwordCorrect = await verifyPassword(user.password, args.password);
      if (!passwordCorrect) {
        throw createLoginError();
      }

      const token = await this.createAccessToken(user._id);
      return {
        user: getSafeUser(user),
        token
      };
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async getByToken(tokenId: string): Promise<User> {
    try {
      const token = await this.tokenCollection.findOne({ _id: tokenId, expiresAt: { $gt: new Date() } });
      if (!token) throw createInvalidAccessTokenError();

      const user = await this.collection.findOne({ _id: token.user });
      if (!user) throw createResourceNotFoundError();

      return getSafeUser(user);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const res = await this.tokenCollection.deleteOne({
        _id: token
      });
      // TODO: what's the point of throwing an exception if the token was not valid?
      if (res.deletedCount !== 1) throw createInvalidAccessTokenError();
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async logoutAll(user: string): Promise<void> {
    try {
      await this.tokenCollection.deleteMany({ user });
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  private async createAccessToken(user: string): Promise<AccessToken> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_VALIDITY_MILLIS);
    const token = {
      _id: generateToken(),
      createdAt: now,
      updatedAt: now,
      expiresAt,
      user
    };

    try {
      const res = await this.tokenCollection.insertOne(token);
      return res.ops[0];
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  private async getById(id: string): Promise<User> {
    try {
      const user = await this.collection.findOne({ _id: id });
      if (!user) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);

      return user;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async initiateDonation(userId: string, args: InitiateDonationArgs): Promise<Transaction> {
    

    try {
      const user = await this.getById(userId);
      const trx = await this.transactions.initiateDonation(user, args);
      return trx;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }
}
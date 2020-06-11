import { Db, Collection } from 'mongodb';
import { generateId, hashPassword, verifyPassword, generateToken, validateId } from '../util';
import { 
  User, DbUser, UserCreateArgs, UserService, 
  AccessToken, UserLoginArgs, UserLoginResult, UserNominateBeneficiaryArgs, UserNominateMiddlemanArgs, UserRole,
} from './types';
import * as messages from '../messages';
import { 
  AppError, createDbOpFailedError, createLoginError,
  createInvalidAccessTokenError, createResourceNotFoundError,
  createUniquenessFailedError,createBeneficiaryNominationFailedError, createMiddlemanNominationFailedError } from '../error';
import { TransactionService, TransactionCreateArgs, Transaction, InitiateDonationArgs, SendDonationArgs } from '../payment';
import * as validators from './validator'

const COLLECTION = 'users';
const TOKEN_COLLECTION = 'access_tokens';
const TOKEN_VALIDITY_MILLIS = 2 * 24 * 3600 * 1000; // 2 days

const SAFE_USER_PROJECTION = { _id: 1, phone: 1, addedBy: 1, donors: 1, middlemanFor: 1, roles: 1, createdAt: 1, updatedAt: 1 };

/**
 * removes fields that should
 * not be shared from the user
 * @param user 
 */
function getSafeUser(user: DbUser): User {
  const { _id, phone, addedBy, donors, middlemanFor, roles, createdAt, updatedAt } = user;
  return {
    _id,
    phone,
    addedBy,
    donors,
    middlemanFor,
    roles,
    createdAt,
    updatedAt
  };
}

function hasRole(user: User, role: UserRole): boolean {
  return user.roles.includes(role);
}

function isMiddleman(user: User): boolean {
  return hasRole(user, 'middleman');
}

function isDonor(user: User): boolean {
  return hasRole(user, 'donor');
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
    validators.validatesCreate(args);
    const now = new Date();
    const user: DbUser = {
      _id: generateId(),
      password: await hashPassword(args.password),
      phone: args.phone,
      addedBy: '',
      donors: [],
      roles: ['donor'],
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await this.collection.insertOne(user);
      return getSafeUser(res.ops[0]);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (e.code == 11000 && e.message.indexOf(args.phone) >= 0) {
        throw createUniquenessFailedError(messages.ERROR_PHONE_ALREADY_IN_USE);
      }

      throw createDbOpFailedError(e.message);
    }
  }

  async nominateBeneficiary(args: UserNominateBeneficiaryArgs): Promise<User> {
    validators.validatesNominateBeneficiary(args);
    const { phone, nominator } = args;
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominator });
      if (!nominatorUser) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);

      let donors: string[] = [];
      if (isDonor(nominatorUser)) {
        donors.push(nominator);
      }

      if (isMiddleman(nominatorUser) && Array.isArray(nominatorUser.middlemanFor)) {
        donors = donors.concat(nominatorUser.middlemanFor);
      }

      if (!donors.length) {
        throw createBeneficiaryNominationFailedError(messages.ERROR_USER_CANNOT_ADD_BENEFICIARY);
      }

      /*
       If phone number does not exist, a new user is created
       with a beneficiary role and the nominator as their donor.
       If, on the other hand, the phone number already exists,
       the user linked to that number must not be a donor 
       simply because a user can not be both a donor and 
       a beneficiary.
      */
      const result = await this.collection.findOneAndUpdate(
        { phone, roles: { $nin: ['donor'] } }, 
        { 
          $addToSet: { roles: 'beneficiary', donors: { $each: donors } }, 
          $currentDate: { updatedAt: true }, 
          $setOnInsert: { 
            _id: generateId(), 
            password: '', 
            phone, 
            addedBy: nominator, 
            createdAt: new Date(),
          } 
        },
        { upsert: true, returnOriginal: false, projection: SAFE_USER_PROJECTION }
      );
      return getSafeUser(result.value);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (e.code == 11000 && e.message.indexOf(args.phone) >= 0) {
        throw createBeneficiaryNominationFailedError();
      }
      throw createDbOpFailedError(e.message);
    }
  }

  async nominateMiddleman(args: UserNominateMiddlemanArgs): Promise<User> {
    validators.validatesNominateMiddleman(args);
    const { phone, nominator } = args;
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominator, roles: 'donor' });
      if (!nominatorUser) throw createMiddlemanNominationFailedError();

      const result = await this.collection.findOneAndUpdate(
        { phone },
        {
          $addToSet: { roles: 'middleman', middlemanFor: nominator },
          $currentDate: { updatedAt: true },
          $setOnInsert: {
            _id: generateId(),
            password: '',
            phone,
            addedBy: nominator,
            createdAt: new Date()
          }
        },
        { upsert: true, returnOriginal: false, projection: SAFE_USER_PROJECTION }
      );
      return getSafeUser(result.value);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (e.code == 11000 && e.message.indexOf(args.phone) >= 0) {
        throw createMiddlemanNominationFailedError();
      }
      throw createDbOpFailedError(e.message);
    }
  }

  async getAllBeneficiariesByUser(userId: string): Promise<User[]> {
    validators.validatesGetAllBeneficiariesByUser(userId);
    try {
      const result = await this.collection.find({ donors: { $in: [userId] } }, { projection: SAFE_USER_PROJECTION }).toArray();
      return result;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async getAllMiddlemenByUser(userId: string): Promise<User[]> {
    validateId(userId);
    try {
      const result = await this.collection.find({ middlemanFor: { $in: [userId] } }, { projection: SAFE_USER_PROJECTION }).toArray();
      return result;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async login(args: UserLoginArgs): Promise<UserLoginResult> {
    validators.validatesLogin(args);
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
    validators.validatesGetByToken(tokenId);
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
    validators.validatesLogout(token);
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
    validators.validatesLogoutAll(user);
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
      const user = await this.collection.findOne({ _id: id }, { projection: SAFE_USER_PROJECTION });
      if (!user) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);

      return getSafeUser(user);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async initiateDonation(userId: string, args: InitiateDonationArgs): Promise<Transaction> {
    validators.validatesInitiateDonation({ userId, amount: args.amount });
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

  async sendDonation(from: string, to: string, args: SendDonationArgs): Promise<Transaction> {
    try {
      const users = await this.collection.find({ _id: { $in: [from, to] } }, { projection: SAFE_USER_PROJECTION } ).toArray();
      const donor = users.find(u => u._id === from);
      const beneficiary = users.find(u => u._id === to);
      const result = await this.transactions.sendDonation(donor, beneficiary, args);
      return result;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }
}
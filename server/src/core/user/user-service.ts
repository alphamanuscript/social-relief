import { Db, Collection } from 'mongodb';
import { generateId, hashPassword, verifyPassword, verifyGoogleIdToken, generateToken, validateId } from '../util';
import { 
  User, DbUser, UserCreateArgs, UserService, 
  AccessToken, UserLoginArgs, UserLoginResult, UserNominateArgs, UserRole,
} from './types';
import * as messages from '../messages';
import { 
  AppError, createDbOpFailedError, createLoginError,
  createInvalidAccessTokenError, createResourceNotFoundError,
  createUniquenessFailedError, createBeneficiaryNominationFailedError,
  createMiddlemanNominationFailedError, isMongoDuplicateKeyError, rethrowIfAppError } from '../error';
import { TransactionService, TransactionCreateArgs, Transaction, InitiateDonationArgs, SendDonationArgs } from '../payment';
import * as validators from './validator'
import { Invitation, InvitationService, InvitationCreateArgs } from '../invitation/types';

const COLLECTION = 'users';
const TOKEN_COLLECTION = 'access_tokens';
const TOKEN_VALIDITY_MILLIS = 2 * 24 * 3600 * 1000; // 2 days

const SAFE_USER_PROJECTION = { 
  _id: 1,
  phone: 1,
  email: 1,
  name: 1,
  addedBy: 1,
  donors: 1,
  middlemanFor: 1,
  roles: 1,
  createdAt: 1,
  updatedAt: 1
};
const NOMINATED_USER_PROJECTION = { _id: 1, phone: 1, name: 1, createdAt: 1 };
const RELATED_BENEFICIARY_PROJECTION = { _id: 1, name: 1, addedBy: 1, createdAt: 1};

/**
 * removes fields that should
 * not be shared from the user
 * @param user 
 */
function getSafeUser(user: DbUser): User {
  const userDict: any = user;
  return Object.keys(SAFE_USER_PROJECTION)
    .reduce<any>((safeUser, field) => {
      if (field in user) {
        safeUser[field] = userDict[field];
      }

      return safeUser;
    }, {});
      
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
  invitations: InvitationService
};

export class Users implements UserService {
  private db: Db;
  private collection: Collection<DbUser>;
  private tokenCollection: Collection<AccessToken>;
  private indexesCreated: boolean;
  private transactions: TransactionService;
  private invitations: InvitationService;

  constructor(db: Db, args: UsersArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.tokenCollection = this.db.collection(TOKEN_COLLECTION);
    this.indexesCreated = false;
    this.transactions = args.transactions;
    this.invitations = args.invitations;
  }

  async createIndexes(): Promise<void> {
    if (this.indexesCreated) return;

    try {
      // unique phone and partial email indexes
      await this.collection.createIndex({ 'phone': 1 }, { unique: true, sparse: false });
      await this.collection.createIndex(
        { email: 1 }, 
        { 
          unique: true, 
          partialFilterExpression: {
            email: { $exists: true }
          }
        }
      );
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
      phone: args.phone,
      name: args.name,
      addedBy: '',
      donors: [],
      roles: ['donor'],
      createdAt: now,
      updatedAt: now
    };

    try {
      if (args.password) {
        user.password = await hashPassword(args.password);
        user.email = args.email;
      }
      else if (args.googleIdToken) {
        const googleUserData = await verifyGoogleIdToken(args.googleIdToken);
        user.email = googleUserData.email;
        user.name = googleUserData.name;
      }

      const res = await this.collection.insertOne(user);
      return getSafeUser(res.ops[0]);
    }
    catch (e) {
      rethrowIfAppError(e);

      if (isMongoDuplicateKeyError(e, args.phone)) {
        throw createUniquenessFailedError(messages.ERROR_PHONE_ALREADY_IN_USE);
      }

      if (isMongoDuplicateKeyError(e, args.email)) {
        throw createUniquenessFailedError(messages.ERROR_EMAIL_ALREADY_IN_USE);
      }

      throw createDbOpFailedError(e.message);
    }
  }

  async nominate(args: UserNominateArgs): Promise<Invitation> {
    validators.validatesNominate(args);
    const { phone, email, nominator, name, role } = args;
    
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominator });
      if (nominatorUser && nominatorUser.roles.includes('beneficiary')) 
        throw createBeneficiaryNominationFailedError(messages.ERROR_USER_CANNOT_ADD_BENEFICIARY);
      else if (!nominatorUser) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);
        
      const invitationArgs: InvitationCreateArgs = {
        invitor: nominator,
        inviteeName: name,
        inviteePhone: phone,
        inviteeEmail: email,
        inviteeRole: role,
      }
      const invitation = await this.invitations.create(invitationArgs);
      return invitation;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async nominateBeneficiary(args: UserNominateArgs): Promise<User> {
    const { phone, email, nominator, name } = args;
    // validators.validatesNominate(args);

    try {
      const nominatorUser = await this.collection.findOne({ _id: nominator });

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
      const insert: any = {
        _id: generateId(), 
        password: '', 
        phone,
        name,
        addedBy: nominator, 
        createdAt: new Date(),
      }
      if (email) insert.email = email;
      const result = await this.collection.findOneAndUpdate(
        { phone, roles: { $nin: ['donor'] } }, 
        { 
          $addToSet: { roles: 'beneficiary', donors: { $each: donors } }, 
          $currentDate: { updatedAt: true }, 
          $setOnInsert: insert
        },
        { upsert: true, returnOriginal: false, projection: NOMINATED_USER_PROJECTION }
      );
      return getSafeUser(result.value);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (isMongoDuplicateKeyError(e, args.phone)) {
        throw createBeneficiaryNominationFailedError();
      }
      throw createDbOpFailedError(e.message);
    }
  }

  async nominateMiddleman(args: UserNominateArgs): Promise<User> {
    const { phone, email, nominator, name } = args;
    // validators.validatesNominate(args);
    
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominator, roles: 'donor' });

      const insert: any = {
        _id: generateId(),
        password: '',
        phone,
        name,
        addedBy: nominator,
        createdAt: new Date()
      }
      if (email) insert.email = email;
      const result = await this.collection.findOneAndUpdate(
        { phone },
        {
          $addToSet: { roles: 'middleman', middlemanFor: nominator },
          $currentDate: { updatedAt: true },
          $setOnInsert: insert
        },
        { upsert: true, returnOriginal: false, projection: NOMINATED_USER_PROJECTION }
      );
      return getSafeUser(result.value);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (isMongoDuplicateKeyError(e, args.phone)) {
        throw createMiddlemanNominationFailedError();
      }
      throw createDbOpFailedError(e.message);
    }
  }

  async getAllBeneficiariesByUser(userId: string): Promise<User[]> {
    validators.validatesGetAllBeneficiariesByUser(userId);
    try {
      const result = await this.collection.find({ donors: { $in: [userId] } }, { projection: RELATED_BENEFICIARY_PROJECTION }).toArray();
      return result;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async getAllMiddlemenByUser(userId: string): Promise<User[]> {
    validateId(userId);
    try {
      const result = await this.collection.find({ middlemanFor: { $in: [userId] } }, { projection: NOMINATED_USER_PROJECTION }).toArray();
      return result;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async login(args: UserLoginArgs): Promise<UserLoginResult> {
    validators.validatesLogin(args);
    try {
      let user;
      if (args.phone) {
        user = await this.collection.findOne({ phone: args.phone });
        if (!user) throw createLoginError();

        if (args.password) {
          const passwordCorrect = await verifyPassword(user.password, args.password);
          if (!passwordCorrect) throw createLoginError();
        }
        else if (args.googleIdToken) {
          const googleUserData = await verifyGoogleIdToken(args.googleIdToken);
          const emailCorrect = user.email && user.email === googleUserData.email;
          if (!emailCorrect) throw createLoginError();
        }
      }
      else if (args.googleIdToken) {
        const { email } = await verifyGoogleIdToken(args.googleIdToken);
        user = await this.collection.findOne({ email: email });
        if (!user) throw createLoginError();
      }

      const token = await this.createAccessToken(user._id);
      return {
        user: getSafeUser(user),
        token
      };
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async getByToken(tokenId: string): Promise<User> {
    validators.validatesGetByToken(tokenId);
    try {
      const token = await this.tokenCollection.findOne({ _id: tokenId, expiresAt: { $gt: new Date() } });
      if (!token) throw createInvalidAccessTokenError();

      const user = await this.collection.findOne({ _id: token.user });
      if (!user) throw createInvalidAccessTokenError();

      return getSafeUser(user);
    }
    catch (e) {
      rethrowIfAppError(e);
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
      rethrowIfAppError(e);
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
      rethrowIfAppError(e);
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
      rethrowIfAppError(e);
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
      rethrowIfAppError(e);
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
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }
}
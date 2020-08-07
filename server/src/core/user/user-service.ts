import { Db, Collection } from 'mongodb';
import { generateId, hashPassword, verifyPassword, verifyGoogleIdToken, generateToken, validateId } from '../util';
import { 
  User, DbUser, UserCreateArgs, UserService, UserPutArgs,
  AccessToken, UserLoginArgs, UserLoginResult, UserNominateArgs, UserRole,
  UserActivateArgs, UserActivateBeneficiaryArgs, UserActivateMiddlemanArgs
} from './types';
import * as messages from '../messages';
import { 
  AppError, createDbOpFailedError, createLoginError,
  createInvalidAccessTokenError, createResourceNotFoundError,
  createUniquenessFailedError, createBeneficiaryNominationFailedError, createBeneficiaryActivationFailedError,
  createMiddlemanActivationFailedError, isMongoDuplicateKeyError, rethrowIfAppError, createTransactionRejectedError } from '../error';
import { TransactionService, Transaction, InitiateDonationArgs, SendDonationArgs, TransactionCompletedEventData } from '../payment';
import * as validators from './validator'
import { Invitation, InvitationService, InvitationCreateArgs } from '../invitation/types';
import { EventBus, Event } from '../event';
import { SystemLockService } from '../system-lock';

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
  transactionsBlockedReason: 1,
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
  invitations: InvitationService,
  systemLocks: SystemLockService,
  eventBus: EventBus;
};

export class Users implements UserService {
  private db: Db;
  private collection: Collection<DbUser>;
  private tokenCollection: Collection<AccessToken>;
  private indexesCreated: boolean;
  private transactions: TransactionService;
  private invitations: InvitationService;
  private eventBus: EventBus;
  private systemLocks: SystemLockService;

  constructor(db: Db, args: UsersArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.tokenCollection = this.db.collection(TOKEN_COLLECTION);
    this.indexesCreated = false;
    this.transactions = args.transactions;
    this.invitations = args.invitations;
    this.eventBus = args.eventBus;
    this.systemLocks = args.systemLocks;

    this.registerEventHandlers();
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
    const { phone, email, nominatorId, nominatorName, name, role } = args;
    
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominatorId });
      if (nominatorUser && nominatorUser.roles.includes('beneficiary')) 
        throw createBeneficiaryNominationFailedError(messages.ERROR_USER_CANNOT_ADD_BENEFICIARY);
      else if (!nominatorUser) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);

      const inviteeUser = await this.collection.findOne({ phone });
      const invitationArgs: InvitationCreateArgs = {
        invitorId: nominatorId,
        invitorName: nominatorName,
        inviteeName: name,
        inviteePhone: phone,
        inviteeEmail: email,
        inviteeRole: role,
        hasAccount: inviteeUser ? true : false
      }
      const invitation = await this.invitations.create(invitationArgs);
      this.eventBus.emitUserInvitationCreated({
        recipientName: invitation.inviteeName,
        recipientPhone: invitation.inviteePhone,
        senderName: invitation.invitorName,
        role: invitation.inviteeRole,
        invitationId: invitation._id
      });
      return invitation;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async activate(args: UserActivateArgs): Promise<User> {
    validators.validatesActivate(args);
    const { invitationId } = args;
    try {
      const invitation = await this.invitations.get(invitationId);
      if (invitation.status !== 'accepted') 
        throw createResourceNotFoundError(messages.ERROR_INVITATION_NOT_FOUND);
      
      const args = {
        phone: invitation.inviteePhone,
        name: invitation.inviteeName,
        email: invitation.inviteeEmail,
        nominatorId: invitation.invitorId,
      }
      if (invitation.inviteeRole === 'beneficiary') { 
        return this.activateBeneficiary(args); 
      }
      return this.activateMiddleman(args);
    }
    catch(e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  /**
   * activates an existing user as a beneficiary
   * only if they're not a donor. If user does not
   * exist, however, a user account is created 
   * with the role 'beneficiary'
   * @param args 
   */
  private async activateBeneficiary(args: UserActivateBeneficiaryArgs): Promise<User> {
    const { phone, email, nominatorId, name } = args;
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominatorId });

      let donors: string[] = [];
      if (isDonor(nominatorUser)) {
        donors.push(nominatorId);
      }

      if (isMiddleman(nominatorUser) && Array.isArray(nominatorUser.middlemanFor)) {
        donors = donors.concat(nominatorUser.middlemanFor);
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
        addedBy: nominatorId, 
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
        throw createBeneficiaryActivationFailedError();
      }
      throw createDbOpFailedError(e.message);
    }
  }

  /**
   * activates a user as a middleman to the nominating donor.
   * A user account is created for the middleman if does not already exist
   * @param args
   * @params args.nominatorId ID donor nominating the middleman
   * @params args.phone phone of the nominated middleman
   * @params args.email email of the nominated middleman
   */
  private async activateMiddleman(args: UserActivateMiddlemanArgs): Promise<User> {
    const { phone, email, nominatorId, name } = args;
    
    try {
      const nominatorUser = await this.collection.findOne({ _id: nominatorId, roles: 'donor' });

      const insert: any = {
        _id: generateId(),
        password: '',
        phone,
        name,
        addedBy: nominatorId,
        createdAt: new Date()
      }
      if (email) insert.email = email;
      const result = await this.collection.findOneAndUpdate(
        { phone },
        {
          $addToSet: { roles: 'middleman', middlemanFor: nominatorId },
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
        throw createMiddlemanActivationFailedError();
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

  public async getById(id: string): Promise<User> {
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

  async getNew(userId: string): Promise<User> {
    validators.validatesGetNew(userId);
    try {
      const user = await this.collection.findOne({ _id: userId, password: '' }, { projection: SAFE_USER_PROJECTION });
      if (!user) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);

      return getSafeUser(user);
    }
    catch(e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async put(userId: string, args: UserPutArgs): Promise<User> {
    validators.validatesPut({ userId, args });
    args.password = await hashPassword(args.password);
    const { name, email, password } = args;
    try {
      const updatedUser = await this.collection.findOneAndUpdate(
        { _id: userId },
        { 
          $set: { name, email, password },
          $currentDate: { updatedAt: true },
        },
        { upsert: true, returnOriginal: false }
      );

      if (!updatedUser) throw createResourceNotFoundError(messages.ERROR_USER_NOT_FOUND);
      return getSafeUser(updatedUser.value);
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
      
      if (user.transactionsBlockedReason) throw createTransactionRejectedError();

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

      if (donor.transactionsBlockedReason) throw createTransactionRejectedError();

      const result = await this.transactions.sendDonation(donor, beneficiary, args);
      return result;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async initiateRefund(userId: string): Promise<Transaction> {
    const lock = this.systemLocks.distribution();
    try {
      await lock.ensureUnlocked();
      const result = await this.collection.findOneAndUpdate({
        _id: userId,
        transactionsBlockedReason: { $exists: false }
      }, {
        $set: {
          locked: true,
          // block future transactions while refund is pending
          transactionsBlockedReason: 'refundPending'
        }
      });

      if (!result.value) throw createTransactionRejectedError(messages.ERROR_REFUND_REQUEST_REJECTED);

      const transaction = await this.transactions.initiateRefund(result.value);
      return transaction;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private registerEventHandlers() {
    this.eventBus.onTransactionCompleted(event => this.handleRefundCompleted(event));
  }

  private async handleRefundCompleted(event: Event<TransactionCompletedEventData>) {
    const { data: { transaction } } = event;

    if (!(transaction.status === 'success' && transaction.type === 'refund')) return;

    try {
      // remove transaction block from user if the block is due to the refund
      await this.collection.findOneAndUpdate({
        _id: transaction.to,
        transactionsBlockedReason: 'refundPending'
      }, {
        $unset: { transactionsBlockedReason: '' }
      });
    }
    catch (e) {
      console.error('Error occurred when handling event', event, e);
    }
  }
}
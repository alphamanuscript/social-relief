import { Db, Collection, FindAndModifyWriteOpResultObject } from 'mongodb';
import { generateId } from '../util';
import { VerificationRecord, VerificationService } from './types';
import { UserService, User } from '../user';
import { SmsProvider } from '../sms';
import { Links } from '../link-generator';
import { createPhoneVerificationSms } from '../message';
import { createDbOpFailedError, rethrowIfAppError, 
        createPhoneVerificationRecordNotFoundError, 
        createPhoneAlreadyVerifiedError, isMongoDuplicateKeyError, 
        createUniquenessFailedError  } from '../error';
import * as messages from '../messages';
import { EventBus, Event } from '../event';
import { UserCreatedEventData, UserActivatedEventData } from '../user';

const COLLECTION = 'phone-verifications';
const SAFE_PHONE_VERIFICATION_RECORD_PROJECTION = { 
  _id: 1,
  phone: 1,
  isVerified: 1,
  createdAt: 1,
  updatedAt: 1
};

export interface PhoneVerificationRecord extends VerificationRecord {
  /**
   * A 6-digit unique code
   */ 
  code: string, 
  phone: string,
}

export interface PhoneVerificationArgs {
  smsProvider: SmsProvider;
  users: UserService;
  links: Links;
  eventBus: EventBus;
}

export interface PhoneVerificationRecordCreateArgs {
  code: string;
  phone: string;
}

export class PhoneVerification implements VerificationService {
  private db: Db;
  private collection: Collection<PhoneVerificationRecord>;
  private indexesCreated: boolean;
  private args: PhoneVerificationArgs;

  constructor(db: Db, args: PhoneVerificationArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.args = args;
    this.indexesCreated = false;

    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    this.args.eventBus.onUserCreated(event => this.handleUserCreated(event));
    this.args.eventBus.onUserActivated(event => this.handleUserActivated(event));
  }

  async handleUserCreated(event: Event<UserCreatedEventData>) {
    return await this.handleUserCreatedOrActivated(event);
  }

  async handleUserActivated(event: Event<UserActivatedEventData>) {
    return await this.handleUserCreatedOrActivated(event);
  }

  async handleUserCreatedOrActivated(event: Event<UserCreatedEventData | UserActivatedEventData>) {
    const { data: { user } } = event;

    try {
      const code = generateId();
      await this.sendVerificationSms(user, code);
      const record = await this.create({ code, phone: user.phone });
    }
    catch(e) {
      console.error('Error occurred when handling event', event, e);
    }
  }

  async create(args: PhoneVerificationRecordCreateArgs): Promise<PhoneVerificationRecord> {
    const { code, phone } = args;
    try {
      const now = new Date();
      const record = { 
        _id: generateId(),
        code,
        phone,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      }

      const res = await this.collection.insertOne(record);
      return res.ops[0];
    }
    catch (e) {
      rethrowIfAppError(e);

      if (isMongoDuplicateKeyError(e, args.phone)) {
        throw createUniquenessFailedError(messages.ERROR_PHONE_ALREADY_IN_USE);
      }

      throw createDbOpFailedError(e.message);
    }
  }

  public async getById(id: string): Promise<PhoneVerificationRecord> {
    try {
      const record = await this.collection.findOne(
        { _id: id }, 
        { projection: SAFE_PHONE_VERIFICATION_RECORD_PROJECTION }
      );
      
      if (!record) {
        throw createPhoneVerificationRecordNotFoundError(messages.ERROR_PHONE_VERIFICATION_RECORD_NOT_FOUND);
      } 

      return record;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async createIndexes(): Promise<void> {
    if (this.indexesCreated) return;

    try {
      // unique phone index
      await this.collection.createIndex({ 'phone': 1 }, { unique: true, sparse: false });
      
      this.indexesCreated = true;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async sendVerificationSms(user: User, code:  string): Promise<void> {
    try {
      const code = generateId();
      const link = await this.args.links.getPhoneVerificationLink(code);
      const smsMessage = createPhoneVerificationSms(user, link);
      await this.args.smsProvider.sendSms(user.phone, smsMessage);
      this.createIndexes();
    }
    catch(e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  public async confirmVerificationCode(code: string): Promise<PhoneVerificationRecord> {
    try { 
      const record = await this.collection.findOne({ _id: code });
      if (!record) {
        throw createPhoneVerificationRecordNotFoundError(messages.ERROR_PHONE_VERIFICATION_RECORD_NOT_FOUND);
      }
      else if (record.isVerified) {
        throw createPhoneAlreadyVerifiedError(messages.ERROR_PHONE_ALREADY_VERIFIED);
      }
      else {
        const result = await this.collection.findOneAndUpdate(
          { _id: code }, 
          {
            $set: { isVerified: true },
            $currentDate: { updatedAt: true }, 
          },
          { upsert: true, returnOriginal: false }
        );

        const user = await this.args.users.getByPhone(result.value.phone);
        await this.args.users.verifyUser(user);
        return result.value;
        
      }
    }
    catch(e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }
}
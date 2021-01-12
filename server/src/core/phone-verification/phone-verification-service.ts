import { Db, Collection, FindAndModifyWriteOpResultObject } from 'mongodb';
import { generateId, generatePhoneVerificationCode } from '../util';
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
import * as validators from './validator';

const COLLECTION = 'phone-verifications';
const SAFE_PHONE_VERIFICATION_RECORD_PROJECTION = { 
  _id: 1,
  phone: 1,
  isVerified: 1,
  createdAt: 1,
  updatedAt: 1
};

export interface PhoneVerificationRecord extends VerificationRecord {
  phone: string,
}

export interface DbPhoneVerificationRecord extends PhoneVerificationRecord {
  /**
   * A 6-digit unique code
   */ 
  code: number,
}

export interface PhoneVerificationArgs {
  smsProvider: SmsProvider;
  users: UserService;
  links: Links;
  eventBus: EventBus;
}

export interface PhoneVerificationRecordCreateArgs {
  id: string,
  code: number;
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
  }

  async create(phone: string): Promise<PhoneVerificationRecord> {
    validators.validatesCreate(phone);
    try {
      const id = generateId(); // id to be given to the phone verification record
      const code = generatePhoneVerificationCode();
      await this.sendVerificationSms(phone, id, code);

      const now = new Date();
      const record: DbPhoneVerificationRecord = { 
        _id: id,
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

      if (isMongoDuplicateKeyError(e, phone)) {
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

      else if (record.isVerified) {
        throw createPhoneAlreadyVerifiedError(messages.ERROR_PHONE_ALREADY_VERIFIED);
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

  async sendVerificationSms(phone: string, id: string, code:  number): Promise<void> {
    try {
      const link = await this.args.links.getPhoneVerificationLink(id);
      const smsMessage = createPhoneVerificationSms(code, link);
      await this.args.smsProvider.sendSms(phone, smsMessage);
      this.createIndexes();
    }
    catch(e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  public async confirmVerificationCode(id: string, code: number): Promise<PhoneVerificationRecord> {
    validators.validatesConfirmVerificationCode({ recordId: id, code});
    try {
      const record = await this.collection.findOne(
        { _id: id, code }, 
        { projection: SAFE_PHONE_VERIFICATION_RECORD_PROJECTION }
      );

      console.log('record: ', record);

      if (!record) {
        throw createPhoneVerificationRecordNotFoundError(messages.ERROR_PHONE_VERIFICATION_RECORD_NOT_FOUND);
      }

      else if (record.isVerified) {
        throw createPhoneAlreadyVerifiedError(messages.ERROR_PHONE_ALREADY_VERIFIED);
      }

      else {
        const result = await this.collection.findOneAndUpdate(
          { _id: id },
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

  async resendVerificationCode(id: string): Promise<PhoneVerificationRecord> {
    validators.validatesResendVerificationCode(id);
    try {
      const record = await this.collection.findOne(
        { _id: id, isVerified: false }, 
        { projection: SAFE_PHONE_VERIFICATION_RECORD_PROJECTION }
      );

      if (!record) {
        throw createPhoneVerificationRecordNotFoundError(messages.ERROR_PHONE_VERIFICATION_RECORD_NOT_FOUND);
      }

      else if (record.isVerified) {
        throw createPhoneAlreadyVerifiedError(messages.ERROR_PHONE_ALREADY_VERIFIED);
      }

      else {
        const newCode = generatePhoneVerificationCode();
        await this.sendVerificationSms(record.phone, id, newCode);

        const result = await this.collection.findOneAndUpdate(
          { _id: id },
          {
            $set: { code: newCode },
            $currentDate: { updatedAt: true }, 
          },
          { upsert: true, returnOriginal: false }
        );

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
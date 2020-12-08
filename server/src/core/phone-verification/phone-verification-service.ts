import { Db, Collection } from 'mongodb';
import { generateId } from '../util';
import { VerificationService } from './types';
import { UserService, User } from '../user';
import { SmsProvider } from '../sms';
import { Links } from '../link-generator';
import { createPhoneVerificationSms } from '../message';
import { createDbOpFailedError, rethrowIfAppError } from '../error';

const COLLECTION = 'phone-verifications';

export interface PhoneVerificationRecord {
  _id: string,
  phone: string,
  createdAt: Date,
  updatedAt: Date,
}

export interface PhoneVerificationArgs {
  smsProvider: SmsProvider;
  users: UserService;
  links: Links
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

  async sendSms(user: User): Promise<void> {
    try {
      const code = generateId();
      const link = await this.args.links.getPhoneVerificationLink(code);
      const smsMessage = createPhoneVerificationSms(user, link);
      await this.args.smsProvider.sendSms(user.phone, smsMessage);
    }
    catch(e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async confirmSms(): Promise<void> {
    // TODO
  }
}
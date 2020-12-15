import { Db, Collection } from 'mongodb';
import { generateId } from '../util';
import { VerificationService } from './types';
import { UserService, User } from '../user';
import { SmsProvider } from '../sms';
import { Links } from '../link-generator';
import { createPhoneVerificationSms } from '../message';
import { createDbOpFailedError, rethrowIfAppError, createPhoneVerificationRecordNotFoundError, createPhoneAlreadyVerifiedError } from '../error';
import * as messages from '../messages';
import { EventBus, Event } from '../event';
import { UserCreatedEventData, UserActivatedEventData } from '../user';

const COLLECTION = 'phone-verifications';

export interface PhoneVerificationRecord {
  _id: string,
  phone: string,
  isVerified: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export interface PhoneVerificationArgs {
  smsProvider: SmsProvider;
  users: UserService;
  links: Links;
  eventBus: EventBus;
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
    console.log('Calling handleUserCreated...');
    return await this.handleUserCreatedOrActivated(event);
  }

  async handleUserActivated(event: Event<UserActivatedEventData>) {
    console.log('Calling handleUserActivated...');
    return await this.handleUserCreatedOrActivated(event);
  }

  async handleUserCreatedOrActivated(event: Event<UserCreatedEventData | UserActivatedEventData>) {
    const { data: { user } } = event;

    try {
      await this.sendVerificationSms(user);
    }
    catch(e) {
      console.error('Error occurred when handling event', event, e);
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

  async sendVerificationSms(user: User): Promise<void> {
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

  async confirmVerificationCode(code: string): Promise<void> {
    try { 
      const record = await this.collection.findOne({ _id: code });
      if (!record) {
        throw createPhoneVerificationRecordNotFoundError(messages.ERROR_PHONE_VERIFICATION_RECORD_NOT_FOUND);
      }
      else if (record.isVerified) {
        throw createPhoneAlreadyVerifiedError(messages.ERROR_PHONE_ALREADY_VERIFIED);
      }
      else {
        const user = await this.args.users.getByPhone(record.phone);
        await this.args.users.verifyUser(user);
      }
    }
    catch(e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }
}
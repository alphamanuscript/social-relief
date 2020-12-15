import { SmsProvider } from '../sms';
import { User } from '../user';
import { BulkMessagesTransport as BulkMessageTransport } from './types';

export interface DefaultBulkMessageSenderArgs {
  smsProvider: SmsProvider;
}

export class DefaultBulkMessageTransport implements BulkMessageTransport {
  smsProvider: SmsProvider;

  constructor(args: DefaultBulkMessageSenderArgs) {
    this.smsProvider = args.smsProvider;
  }

  async sendMessage(recipient: User, message: string): Promise<void> {
    await this.smsProvider.sendSms(recipient.phone, message);
  }
  
}
import createAtClient = require('africastalking');
import { SmsService as AtSmsService, SendArgs } from 'africastalking-types';
import { SmsProvider, SendResult } from './types';
import { rethrowIfAppError, createMessageDeliveryFailedError, createAtApiError } from '../error';

export interface AtSmsProviderArgs {
  username: string,
  apiKey: string,
  sender: string
};

export class AtSmsProvider implements SmsProvider {
  private atClient: any;
  private smses: AtSmsService;
  private sender: string;

  constructor(args: AtSmsProviderArgs) {
    this.atClient = createAtClient({ username: args.username, apiKey: args.apiKey });
    this.smses = this.atClient.SMS;
    this.sender = args.sender;
  }

  async sendSms(to: string, message: string): Promise<SendResult> {
    const args: SendArgs = {
      // Africa's Talking phone numbers should have the leading + symbol
      to: [`+${to}`],
      message
    };

    if (this.sender) {
      args.from = this.sender;
    }

    try {
      const res = await this.smses.send(args);

      if (res.SMSMessageData.Recipients[0].status === 'Success') return res;
      
      throw createMessageDeliveryFailedError('Failed to send message');
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createAtApiError(e.message);
    }
  }
}
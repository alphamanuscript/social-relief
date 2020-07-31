import createAtClient = require('africastalking');
import { SmsService as AtSMSService, SendArgs } from 'africastalking-types';
import { SmsProvider, SendResult } from './types';
import { AppError, rethrowIfAppError, createMessageDeliveryFailedError, createAtApiError } from '../error';

export interface AtArgs {
  username: string,
  apiKey: string
};

export class AtSmsProvider implements SmsProvider {
  private atClient: any;
  private smses: AtSMSService;

  constructor(args: AtArgs) {
    this.atClient = createAtClient({ username: args.username, apiKey: args.apiKey });
    this.smses = this.atClient.SMS;
  }

  async sendSms(to: string, message: string): Promise<SendResult> {
    const args: SendArgs = {
      to: [to],
      message
    };

    try {
      const res = await this.smses.send(args);

      if (res.SMSMessageData.Recipients[0].status === 'Success') return res;
      
      throw createMessageDeliveryFailedError('Failed to send message');
    }
    catch (e) {
      if (e instanceof AppError) rethrowIfAppError(e);
      throw createAtApiError(e.message);
    }
  }
}
import createAtClient = require('africastalking');
import { SmsService as AtSMSService, SendArgs } from 'africastalking-types';
import { SMSProvider, SendResult } from './types';
import { AppError, createMessageDeliveryFailedError, createAtApiError } from '../error';
import { User } from '../user/types';

export interface AtArgs {
  username: string,
  apiKey: string
};

export class AtSMSProvider implements SMSProvider {
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
      if (e instanceof AppError) throw e;
      throw createAtApiError(e.message);
    }
  }
}
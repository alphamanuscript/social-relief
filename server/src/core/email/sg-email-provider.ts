import { EmailProvider } from './types';
import { rethrowIfAppError, createEmailDeliveryFailedError, createAtApiError } from '../error';
import sgMail = require('@sendgrid/mail');

export interface sgEmailProviderArgs {
  apiKey: string
};

export class sgEmailProvider implements EmailProvider{
  constructor(args: sgEmailProviderArgs) {
    sgMail.setApiKey(args.apiKey);
  }

  async sendEmail(to: string, message: string): Promise<void> { 
    try {
      const res = sgMail.send({
        to,
        from: 'socialrelief-review1.web.app',
        subject: 'Social Relief Notification',
        text: message,
      });

      console.log(res);

      if (!res) {
        throw createEmailDeliveryFailedError('Failed to send email');
      }
    }
    catch (e) {
      console.log(e);
      rethrowIfAppError(e);
      throw createAtApiError(e.message);
    }
  }
}
  
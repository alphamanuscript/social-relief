import { EmailProvider } from './types';
import { rethrowIfAppError, createEmailDeliveryFailedError, createSendGridApiError } from '../error';
import sgMail = require('@sendgrid/mail');

export interface SendGridEmailProviderArgs {
  apiKey: string,
  emailSender: string
};

export class SendGridEmailProvider implements EmailProvider{
  private emailSender: string;

  constructor(args: SendGridEmailProviderArgs) {
    sgMail.setApiKey(args.apiKey);
    this.emailSender = args.emailSender;
  }

  async sendEmail(to: string, message: string): Promise<void> {
    try {
      const res = await sgMail.send({
        to,
        from: this.emailSender,
        subject: 'Social Relief Notification',
        text: message,
      });

      if (res[0].statusCode !== 202) {
        throw createEmailDeliveryFailedError('Failed to send email');
      }
    }
    catch (e) {
      console.log(e);
      rethrowIfAppError(e);
      throw createSendGridApiError(e.message);
    }
  }
}
  
import { EmailProvider } from './types';
import { rethrowIfAppError, createEmailDeliveryFailedError, createSendGridApiError } from '../error';
import sgMail = require('@sendgrid/mail');

export interface sendgridEmailProviderArgs {
  apiKey: string,
  socialReliefEmail: string
};

export class sendgridEmailProvider implements EmailProvider{
  private socialReliefEmail: string;

  constructor(args: sendgridEmailProviderArgs) {
    sgMail.setApiKey(args.apiKey);
    this.socialReliefEmail = args.socialReliefEmail;
  }

  async sendEmail(to: string, message: string): Promise<void> {
    try {
      const res = await sgMail.send({
        to,
        from: this.socialReliefEmail,
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
  
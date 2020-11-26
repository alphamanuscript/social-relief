import { EmailProvider } from './types';
import { rethrowIfAppError, createEmailDeliveryFailedError, createSendGridApiError } from '../error';
import sgMail = require('@sendgrid/mail');

export const DEFAULT_EMAIL_SUBJECT = 'Social Relief Notification';
export const EMAIL_SUBJECT_DONATION_REPORT = 'SocialRelief Donation Report';

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

  async sendEmail(to: string, message: string, subject: string = DEFAULT_EMAIL_SUBJECT): Promise<void> {
    try {
      if (to) {
        const res = await sgMail.send({
          to,
          from: this.emailSender,
          subject,
          html: message,
        });
  
        if (res[0].statusCode !== 202) {
          throw createEmailDeliveryFailedError('Failed to send email');
        }
      }
    }
    catch (e) {
      console.log(e);
      rethrowIfAppError(e);
      throw createSendGridApiError(e.message);
    }
  }
}
  
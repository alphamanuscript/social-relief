import { SmsProvider } from '../sms';
import { EmailProvider } from '../email';
import { EventBus, Event} from '../event';
import { UserService, UserInvitationEventData, User } from '../user';
import { TransactionCompletedEventData, Transaction } from '../payment';

export interface UserNotificationsArgs {
  smsProvider: SmsProvider;
  emailProvider: EmailProvider;
  eventBus: EventBus;
  users: UserService;
  webappBaseUrl: string;
}

export class UserNotifications {
  smsProvider: SmsProvider;
  emailProvider: EmailProvider;
  eventBus: EventBus;
  users: UserService;
  webappBaseUrl: string;

  constructor(args: UserNotificationsArgs) {
      this.smsProvider = args.smsProvider;
      this.emailProvider = args.emailProvider;
      this.eventBus = args.eventBus;
      this.users = args.users;
      this.webappBaseUrl = args.webappBaseUrl;

      this.registerHandlers();
  }

  registerHandlers() {
    this.eventBus.onUserInvitationCreated(event => this.handleUserInvitation(event));
    this.eventBus.onTransactionCompleted(event => this.handleTransactionCompleted(event));
  }

  async handleUserInvitation(event: Event<UserInvitationEventData>) {
    const { data } = event;
    const inviteUrl = `${this.webappBaseUrl}/invitations/${data.invitationId}`;
    const message = `Hello ${data.recipientName}, ${data.senderName} has invited you to join SocialRelief as a ${data.role}. Follow this link to accept ${inviteUrl}`;
    
    try {
      await this.smsProvider.sendSms(data.recipientPhone, message);
      if (data.recipientEmail) {
        await this.emailProvider.sendEmail(data.recipientEmail, message);
      }
    }
    catch (error) {
      console.error('Error occurred handling event', event, error);
    }
  }

  async handleTransactionCompleted(event: Event<TransactionCompletedEventData>) {
    const { data: { transaction } } = event;

    try {
      if (transaction.type === 'distribution' && transaction.status === 'success') {
        // notify donor and beneficiary of a successful distribution
        await this.sendSuccessfulDistributionMessages(transaction);
      }
      else if (transaction.type === 'refund' && transaction.status === 'success') {
        // notify user of successful refund
        await this.sendSuccessfulRefundMessage(transaction);
      }
    }
    catch (error) {
      console.error('Error occurred when handling event', event, error);
    }
  }

  private async sendSuccessfulDistributionMessages(transaction: Transaction) {
    const beneficiary = await this.users.getById(transaction.to);

    const beneficiaryMessage = `Hello ${beneficiary.name}, you have received Ksh ${transaction.amount} from your SocialRelief donors.`;

    await this.smsProvider.sendSms(beneficiary.phone, beneficiaryMessage);

    if (beneficiary.email) {
      await this.emailProvider.sendEmail(beneficiary.email, beneficiaryMessage);
    }
  }

  private async sendSuccessfulRefundMessage(transaction: Transaction) {
    const user = await this.users.getById(transaction.to);
    const message = `Hello ${user.name}, your refund of Ksh ${transaction.amount} from SocialRelief has been issued.`;
    await this.smsProvider.sendSms(user.phone, message);
    if (user.email) {
      await this.emailProvider.sendEmail(user.email, message);
    }
  }
}

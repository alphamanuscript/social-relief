import { SmsProvider } from '../sms';
import { EventBus, Event} from '../event';
import { UserService, UserInvitationEventData } from '../user';
import { TransactionCreatedEventData } from '../payment';

export interface UserNotificationsArgs {
  smsProvider: SmsProvider;
  eventBus: EventBus;
  users: UserService;
  webappBaseUrl: string;
}

export class UserNotifications {
  smsProvider: SmsProvider;
  eventBus: EventBus;
  users: UserService;
  webappBaseUrl: string;

  constructor(args: UserNotificationsArgs) {
      this.smsProvider = args.smsProvider;
      this.eventBus = args.eventBus;
      this.users = args.users;
      this.webappBaseUrl = args.webappBaseUrl;

      this.registerHandlers();
  }

  registerHandlers() {
    this.eventBus.onUserInvitationCreated(event => this.handleUserInvitation(event));
    this.eventBus.onTransactionCompleted(event => this.handlerTransactionCompleted(event));
  }

  async handleUserInvitation(event: Event<UserInvitationEventData>) {
    const { data } = event;
    const inviteUrl = `${this.webappBaseUrl}/invitations/${data.invitationId}`;
    const message = `Hello ${data.recipientName}, ${data.senderName} has invited you to join SocialRelief as a ${data.role}. Follow this link to accept ${inviteUrl}`;
    
    try {
      await this.smsProvider.sendSms(data.recipientPhone, message);
    }
    catch (error) {
      console.error('Error occurred handling event', event, error);
    }
  }

  async handlerTransactionCompleted(event: Event<TransactionCreatedEventData>) {
    const { data: { transaction } } = event;
    
    // notify donor and beneficiary of a successful distribution

    if (!(transaction.type === 'distribution' && transaction.status === 'success')) {
      return;
    }

    try {
      const donor = await this.users.getById(transaction.from);
      const beneficiary = await this.users.getById(transaction.to);

      const donorMessage = `Hello ${donor.name}, Ksh ${transaction.amount} has been sent from your SocialRelief donation to your beneficiary ${beneficiary.name}.`;
      const beneficiaryMessage = `Hello ${beneficiary.name}, you have received Ksh ${transaction.amount} from your SocialRelief donors.`;

      await Promise.all([
        () => this.smsProvider.sendSms(donor.phone, donorMessage),
        () => this.smsProvider.sendSms(beneficiary.phone, beneficiaryMessage)
      ]);
    }
    catch (error) {
      console.error('Error occurred when handling event', event, error);
    }
  }
}
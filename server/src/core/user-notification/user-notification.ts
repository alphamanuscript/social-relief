import { SmsProvider } from '../sms';
import { EventBus, Event, EventName } from '../event';
import { UserNotificationsArgs } from './types';
import { UserInvitationEventData } from '../user';

export class UserNotifications {
  smsProvider: SmsProvider;
  eventBus: EventBus;
  webappBaseUrl: string;

  constructor(args: UserNotificationsArgs) {
      this.smsProvider = args.smsProvider;
      this.eventBus = args.eventBus;
      this.webappBaseUrl = args.webappBaseUrl;

      this.registerHandlers();
  }

  registerHandlers() {
    this.eventBus.on(EventName.USER_INVITATION_CREATED, this.handleUserInvitation.bind(this));
  }

  async handleUserInvitation({ data }: Event<UserInvitationEventData>) {
    const message = `Hello ${data.recipientName}, ${data.senderName} has invited you to join SocialRelief as a ${data.role}. Follow this link to accept ${this.webappBaseUrl}/invitations/${data.invitationId}`
    try {
      await this.smsProvider.sendSms(`+${data.recipientPhone}`, message);
    }
    catch (e) {
      console.error(e);
    }
  }
}
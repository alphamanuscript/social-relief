import { AtSMSProvider } from '../sms';
import { EventBus } from '../event';
import { UserNotificationsArgs } from './types';

export class UserNotifications {
  smsProvider: AtSMSProvider;
  eventBus: EventBus;
  webappBaseUrl: string;

  constructor(args: UserNotificationsArgs) {
      this.smsProvider = args.smsProvider;
      this.eventBus = args.eventBus;
      this.webappBaseUrl = args.webappBaseUrl;

      // this.registerHandlers();
  }

  // registerHandlers() {
  //   this.eventBus.on(EVENT_USER_INVITATION_CREATED, this.handleUserInvitation.bind(this));
  // }

  // handleUserInvitation({ data }: Event<UserInvitationEvent>) {
  //   const message = `Hello ${data.recipient.name}, ${data.sender.name} has invited you to join SocialRelief as a ${data.role}. Follow this link to accept ${this.webappBaseUrl}/invitations/${data.invitiationId};`
  //   this.smsProvider.sendSms(data.recipient.phone, message);
  // }
}
import { EventBus } from '../event';
import { AtSMSProvider } from '../sms';

export interface UserNotificationArgs {
  smsProvider: AtSMSProvider;
  eventBus: EventBus;
  webappBaseUrl: string;
}

export interface UserInvitationEvent {
  
}
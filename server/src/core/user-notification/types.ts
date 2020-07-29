import { EventBus } from '../event';
import { AtSMSProvider } from '../sms';

export interface UserNotificationsArgs {
  smsProvider: AtSMSProvider;
  eventBus: EventBus;
  webappBaseUrl: string;
}
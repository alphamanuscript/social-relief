import { EventBus } from '../event';
import { SmsProvider } from '../sms';

export interface UserNotificationsArgs {
  smsProvider: SmsProvider;
  eventBus: EventBus;
  webappBaseUrl: string;
}
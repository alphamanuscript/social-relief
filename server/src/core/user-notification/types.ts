import { EventBus } from '../event';
import { AtSmsProvider } from '../sms';

export interface UserNotificationsArgs {
  smsProvider: AtSmsProvider;
  eventBus: EventBus;
  webappBaseUrl: string;
}
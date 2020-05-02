import { UserService } from './user';

export interface App {
  users: UserService
};

export interface AppConfig {
  port: number;
  dbUri: string;
  dbName: string;
  atUsername: string;
  atApiKey: string;
  atPaymentsProductName: string;
  atPaymentsProviderChannel: string;
  atWebhooksRoot: string;
};

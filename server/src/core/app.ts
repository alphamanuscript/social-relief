import { UserService } from './user';
import { TransactionService } from './payment';

export interface App {
  users: UserService,
  transactions: TransactionService
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

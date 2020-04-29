import { UserService } from './user';

export interface App {
  users: UserService
};

export interface AppConfig {
  dbUri: string;
  dbName: string;
};

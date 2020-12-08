import { User } from '../user';

export interface VerificationService {
  createIndexes(): Promise<void>;
  sendSms(user: User): Promise<void>;
  confirmSms(): Promise<void>;
}
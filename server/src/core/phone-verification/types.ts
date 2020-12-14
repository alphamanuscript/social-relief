import { User } from '../user';

export interface VerificationService {
  createIndexes(): Promise<void>;
  sendVerificationSms(user: User): Promise<void>;
  confirmVerificationSms(): Promise<void>;
}
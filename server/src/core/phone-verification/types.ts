import { User } from '../user';

export interface VerificationRecord {
  _id: string,
  isVerified: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export interface VerificationService {
  createIndexes(): Promise<void>;
  sendVerificationSms(user: User): Promise<void>;
  confirmVerificationCode(code: string): Promise<VerificationRecord>;
}
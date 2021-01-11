import { User } from '../user';

export interface VerificationRecord {
  _id: string,
  isVerified: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export interface VerificationService {
  createIndexes(): Promise<void>;
  sendVerificationSms(user: User, id: string, code:  number): Promise<void>;
  confirmVerificationCode(id: string, code: number): Promise<VerificationRecord>;
  getById(id: string): Promise<VerificationRecord>;
  create(phone: string): Promise<VerificationRecord>;
}
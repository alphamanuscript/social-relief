
import { User } from '../user/types';
export type TransactionStatus = 'pending' | 'paymentRequested' | 'failed' | 'success';
export type TransactionType = 'donation' | 'distribution';

export interface Transaction {
  _id: string,
  createdAt: Date,
  updatedAt: Date,
  status: TransactionStatus,
  failureReason?: string,
  amount: number,
  from: string,
  to: string,
  type: TransactionType,
  fromExternal: boolean,
  toExternal: boolean,
  provider: string,
  providerTransactionId: string,
  metadata: any
};

export interface TransactionCreateArgs {
  amount: number,
  from: string,
  to: string,
  type: TransactionType,
  fromExternal: boolean,
  toExternal: boolean,
  provider: string,
  providerTransactionId?: string
  status?: TransactionStatus
};

export interface InitiateDonationArgs {
  amount: number
};

export interface TransactionService {
  initiateDonation(user: User, args: InitiateDonationArgs): Promise<Transaction>;
  handleProviderNotification(payload: any): Promise<void>;
}

export interface PaymentRequestResult {
  providerTransactionId: string,
  status: TransactionStatus
};

export interface PaymentNotificationResult {
  status: TransactionStatus;
  failureReason?: string;
  providerTransactionId: string;
  metadata: any;
}

export interface PaymentProvider {
  name(): string;
  requestPaymentFromUser(user: User, amount: number): Promise<PaymentRequestResult>;
  handlePaymentNotification(payload: any): Promise<PaymentNotificationResult>;
}
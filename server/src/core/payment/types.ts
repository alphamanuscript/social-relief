
import { User } from '../user/types';
export type TransactionStatus = 'pending' | 'paymentRequested' | 'failed' | 'success';
export type TransactionType = 'donation' | 'distribution';

export interface Transaction {
  _id: string,
  createdAt: Date,
  updatedAt: Date,
  status: TransactionStatus,
  failureReason?: string,
  expectedAmount: number,
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
  expectedAmount: number,
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
  handleProviderNotification(payload: any): Promise<Transaction>;
  getAllByUser(userId: string): Promise<Transaction[]>;
  checkUserTransactionStatus(userId: string, transactionId: string): Promise<Transaction>;
}

export interface PaymentRequestResult {
  providerTransactionId: string,
  status: TransactionStatus
};

export interface PaymentNotificationResult {
  status: TransactionStatus;
  amount: number;
  userData: {
    phone?: string,
  },
  failureReason?: string;
  providerTransactionId: string;
  metadata: any;
}

export interface PaymentProvider {
  name(): string;
  requestPaymentFromUser(user: User, amount: number): Promise<PaymentRequestResult>;
  handlePaymentNotification(payload: any): Promise<PaymentNotificationResult>;
  getTransaction(id: string): Promise<PaymentNotificationResult>;
}
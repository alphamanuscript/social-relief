
import { User } from '../user/types';
export type TransactionStatus = 'pending' | 'paymentRequested' | 'paymentQueued' |'failed' | 'success';
export type TransactionType = 'donation' | 'distribution' | 'refund';

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
  providerTransactionId?: string,
  metadata: any
};

export interface TransactionCreatedEventData {
  transaction: Transaction;
}

export interface TransactionCreateArgs {
  expectedAmount: number,
  from: string,
  to: string,
  type: TransactionType,
  fromExternal: boolean,
  toExternal: boolean,
  provider: string,
  providerTransactionId?: string
  status?: TransactionStatus,
  metadata?: {
    [name: string]: any
  }
};

export interface InitiateDonationArgs {
  amount: number
};

export interface SendDonationArgs {
  amount: number;
}

export interface TransactionService {
  createIndexes(): Promise<void>;
  initiateDonation(user: User, args: InitiateDonationArgs): Promise<Transaction>;
  sendDonation(from: User, to: User, args: SendDonationArgs): Promise<Transaction>;
  initiateRefund(user: User): Promise<Transaction>;
  handleProviderNotification(providerName: string, payload: any): Promise<Transaction>;
  getAllByUser(userId: string): Promise<Transaction[]>;
  checkUserTransactionStatus(userId: string, transactionId: string): Promise<Transaction>;
}

export interface PaymentRequestResult {
  providerTransactionId: string;
  status: TransactionStatus;
  metadata?: { [name: string]: any }
};

export interface ProviderTransactionInfo {
  status: TransactionStatus;
  amount: number;
  userData: {
    phone?: string,
  },
  failureReason?: string;
  providerTransactionId: string;
  metadata: any;
}

export interface SendFundsResult {
  providerTransactionId: string;
  status: TransactionStatus;
}

export interface PaymentProvider {
  /**
   * gets the name of the payment provider
   */
  name(): string;
  /**
   * initiates a payment request
   * @param user 
   * @param amount 
   */
  requestPaymentFromUser(user: User, amount: number): Promise<PaymentRequestResult>;
  /**
   * handle notification event (e.g. from a webhook)
   * @param payload 
   */
  handlePaymentNotification(payload: any): Promise<ProviderTransactionInfo>;
  /**
   * fetches up-to-date transaction details from the provider
   * @param localTransaction 
   */
  getTransaction(localTransaction: Transaction): Promise<ProviderTransactionInfo>;
  /**
   * send money to specified user
   * @param user 
   * @param amount 
   * @param metadata 
   */
  sendFundsToUser(user: User, amount: number, metadata: any): Promise<SendFundsResult>;
}

export interface PaymentProviderRegistry {
  register(provider: PaymentProvider): void;
  getProvider(name: string): PaymentProvider;
  /**
   * returns the preferred payment provider
   * for receiving money from users
   */
  getPreferredForReceiving(): PaymentProvider;
  /**
   * sets preferred payment provider for
   * receiving money from users
   * @param name 
   */
  setPreferredForReceiving(name: string): void;
  /**
   * sets preferred payment provider for
   * sending money to users
   */
  getPreferredForSending(): PaymentProvider;
  /**
   * gets preferred payment provider for sending money to users
   * @param name
   */
  setPreferredForSending(name: string): void;
}
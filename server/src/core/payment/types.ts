
import { User } from '../user/types';
import { ReportType } from '../distribution-report';
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

export interface TransactionCompletedEventData {
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

export interface DistributionReport {
  donor: string,
  beneficiaries: string[],
  receivedAmount: number[],
  reportType: ReportType,
  totalDistributedAmountFromDonor: number,
  totalDistributedAmountFromAllDonors?: number,
  totalBeneficiaries?: number,
  createdAt: Date
}

export interface InitiateDonationArgs {
  amount: number
};

export interface SendDonationArgs {
  amount: number;
}

export interface TransactionService {
  createIndexes(): Promise<void>;
  /**
   * initiates a transaction to collect donation from the user
   * into the user's account on the platform
   * @param user 
   * @param args 
   */
  initiateDonation(user: User, args: InitiateDonationArgs): Promise<Transaction>;
  /**
   * creates transaction to send donation from donor to beneficiary
   * @param from 
   * @param to 
   * @param args 
   */
  sendDonation(from: User, to: User, args: SendDonationArgs): Promise<Transaction>;
  /**
   * Initiates a transaction to transfer the user's current account balance on the platform
   * back to the user
   * @param user 
   */
  initiateRefund(user: User): Promise<Transaction>;
  /**
   * handle payment notification coming from the the specified payment
   * provider's callback
   * @param providerName 
   * @param payload 
   */
  handleProviderNotification(providerName: string, payload: any): Promise<Transaction>;
  /**
   * get all transactions by the user, sorted in descending chronological order
   * @param userId 
   */
  getAllByUser(userId: string): Promise<Transaction[]>;
  /**
   * fetch the latest status of the transaction from the payment provider
   * and update the transaction accordingly
   * @param userId 
   * @param transactionId 
   */
  checkUserTransactionStatus(userId: string, transactionId: string): Promise<Transaction>;
  /**
   * computes the user's confirmed balance. The balance should be the total
   * of all confirmed (successful) transactions into the user's account (e.g. donations)
   * minus all transactions out of the user's account that have not failed.
   * This means that pending (outgoing) transactions contribute to the computed balance.
   * @param userId 
   */
  getUserBalance(userId: string): Promise<number>;
  /**
   * Generates a daily distribution report doc for every donor, 
   * indicating who benefited from their donation distributions, 
   * how much they received, and how much was distributed in total
   * since the last report
   */
  generateDailyDistributionReportDocs(lastReportDate: Date): Promise<DistributionReport[]>;
  generateMonthlyDistributionReportDocs(lastMonthlyReportDate: Date): Promise<DistributionReport[]> 
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
   * gets preferred payment provider for
   * sending money to users
   */
  getPreferredForSending(): PaymentProvider;
  /**
   * sets preferred payment provider for sending money to users
   * @param name
   */
  setPreferredForSending(name: string): void;
  /**
   * gets preferred payment provider for
   * refunding donated money
   */
  getPreferredForRefunds(): PaymentProvider;
  /**
   * sets preferred payment provider for refunding donated money
   * @param name
   */
  setPreferredForRefunds(name: string): void;
}
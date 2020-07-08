import { UserService } from './user';
import { TransactionService } from './payment';
import { DonationDistributionService } from './distribution';
import { SMSProvider } from './sms';

export interface App {
  users: UserService;
  transactions: TransactionService;
  donationDistributions: DonationDistributionService;
  smsProvider: SMSProvider
};

export interface AppConfig {
  /**
   * Port that the http server will listen on
   */
  port: number;
  /**
   * MongoDB Database URI
   */
  dbUri: string;
  /**
   * MongoDB database name
   */
  dbName: string;
  /**
   * Africa's Talking username
   */
  atUsername: string;
  /**
   * Africa's Talking API Key
   */
  atApiKey: string;
  /**
   * Africa's Talking Payments Product name
   */
  atPaymentsProductName: string;
  /**
   * Africa's Talking Payment Product Channel (i.e. Pay Bill number)
   */
  atPaymentsProviderChannel: string;
  /**
   * Root path of Africa's Talking callback URLS
   * this should be a random and secret string for security
   * to avoid attackers sending fake notifications to our app
   */
  atWebhooksRoot: string;
  /**
   * Maximum amount of funds a beneficiary can receive
   * from donation distributions in a given period
   */
  distributionPeriodLimit: number;
  /**
   * Number of days in a distribution period.
   * The period limit is imposed during
   * a distribution period
   */
  distributionPeriodLength: number;
  /**
   * Interval delay in minutes between two distribution
   * processes
   */
  distributionInterval: number;
  /**
   * Google API Client ID
   */
  googleClientId: string;
};

export function loadAppConfigFromEnv(env: { [key: string]: string }): AppConfig {
  return {
    dbName: env.DB_NAME || 'crowdrelief',
    dbUri: env.DB_URL || 'mongodb://localhost:27017/crowdrelief',
    port: (env.PORT && Number(env.PORT)) || 3000,
    atApiKey: env.AT_API_KEY || '',
    atUsername: env.AT_USERNAME || 'sandbox',
    atPaymentsProductName: env.AT_PAYMENTS_PRODUCT_NAME || 'TestCrowdRelief',
    atPaymentsProviderChannel: env.AT_PAYMENTS_PROVIDER_CHANNEL || '50000',
    atWebhooksRoot: '/at-webhooks',
    distributionPeriodLimit: (env.DISTRIBUTION_PERIOD_LIMIT && Number(env.DISTRIBUTION_PERIOD_LIMIT)) || 2000,
    distributionPeriodLength: (env.DISTRIBUTION_PERIOD_LENGTH && Number(env.DISTRIBUTION_PERIOD_LENGTH)) || 30,
    distributionInterval: (env.DISTRIBUTION_INTERVAL && Number(env.DISTRIBUTION_INTERVAL)) || 1,
    googleClientId: env.GOOGLE_CLIENT_ID
  };
}
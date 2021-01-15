import { UserService } from './user';
import { TransactionService } from './payment';
import { InvitationService } from './invitation';
import { DonationDistributionService } from './distribution';
import { StatsService } from './stat';
import { DistributionReportService } from './distribution-report';
import { BulkMessageService } from './bulk-messaging';
import { VerificationService } from './phone-verification';

export interface App {
  users: UserService;
  transactions: TransactionService;
  invitations: InvitationService;
  donationDistributions: DonationDistributionService;
  stats: StatsService;
  distributionReports: DistributionReportService;
  phoneVerification: VerificationService;
  bulkMessages: BulkMessageService;
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
   * base url of the web app
   */
  webappBaseUrl: string;
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
   * The short code or alphanumeric Sender ID from which
   * SMS via Africa's Talking API are sent
   */
  atSmsSender: string;
  /**
   * Root path of Africa's Talking callback URLS
   * this should be a random and secret string for security
   * to avoid attackers sending fake notifications to our app
   */
  atWebhooksRoot: string;
  /**
   * Root path of the Manual Payment service notifications callback URL.
   * The payment service will call this url to send transaction notifications.
   * It should be random and secret for security purposes.
   */
  manualPayWebhooksRoot: string;
  /**
   * The base url of the Manual Payment service
   */
  manualPayBaseUrl: string;
  /**
   * Flutterwave's API secret key
   */
  flutterwaveSecretKey: string;
  /**
   * URL of the logo to display on Flutterwave's payment dialog
   */
  flutterwaveLogoUrl: string;
  /**
   * URL to redirect the user to after payment is complete
   */
  flutterwaveRedirectUrl: string;
  /**
   * Root path for flutterwave webhooks
   */
  flutterwaveWebhooksRoot: string;
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
   * Interval delay in CronTime syntax/format between two distribution
   * processes
   */
  distributionInterval: string;
  /**
   * Interval delay in CronTime syntax/format between 
   * two daily distribution reporting processes
   */
  dailyDistributionReportingInterval: string;
  /**
   * Interval delay in CronTime syntax/format between 
   * two monthly distribution reporting processes
   */
  monthlyDistributionReportingInterval: string;
  /**
   * Interval delay in CronTime syntax/format between two distribution 
   * processes for vetted beneficiaires
   */
  vettedDistributionInterval: string;
  /**
   * Interval delay in minutes between two
   * processes of computing statistics
   */
  statsComputationInterval: number;
  /**
   * Google API Client ID
   */
  googleClientId: string;
  sendgridApiKey: string;
  bitlyApiKey: string;
  bitlyApiLink: string;
  emailSender: string;
};

export function loadAppConfigFromEnv(env: { [key: string]: string }): AppConfig {
  const webappBaseUrl = env.WEBAPP_BASE_URL || 'http://localhost:8080';

  return {
    dbName: env.DB_NAME || 'crowdrelief',
    dbUri: env.DB_URL || 'mongodb://localhost:27017/crowdrelief',
    port: (env.PORT && Number(env.PORT)) || 3000,
    webappBaseUrl,
    atApiKey: env.AT_API_KEY || '',
    atUsername: env.AT_USERNAME || 'sandbox',
    atPaymentsProductName: env.AT_PAYMENTS_PRODUCT_NAME || 'TestCrowdRelief',
    atPaymentsProviderChannel: env.AT_PAYMENTS_PROVIDER_CHANNEL || '50000',
    atWebhooksRoot: env.AT_WEBHOOKS || '/webhooks/at',
    atSmsSender: env.AT_SMS_SENDER || '',
    manualPayWebhooksRoot: env.MANUAL_PAY_WEBHOOKS || '/webhooks/manualpay',
    manualPayBaseUrl: env.MANUAL_PAY_BASE_URL || 'http://localhost:5000',
    flutterwaveLogoUrl: `${webappBaseUrl}/img/logo.svg`,
    flutterwaveRedirectUrl: `${webappBaseUrl}/post-payment/flutterwave`,
    flutterwaveSecretKey: env.FLUTTERWAVE_SECRET_KEY || '',
    flutterwaveWebhooksRoot: env.FLUTTERWAVE_WEBHOOKS || '/webhooks/flutterwave',
    distributionPeriodLimit: (env.DISTRIBUTION_PERIOD_LIMIT && Number(env.DISTRIBUTION_PERIOD_LIMIT)) || 2000,
    distributionPeriodLength: (env.DISTRIBUTION_PERIOD_LENGTH && Number(env.DISTRIBUTION_PERIOD_LENGTH)) || 30,
    distributionInterval: (env.DISTRIBUTION_INTERVAL) || `0 */2 * * * *`,
    vettedDistributionInterval: (env.VETTED_DISTRIBUTION_INTERVAL) || `0 */5 * * * *`,
    dailyDistributionReportingInterval: (env.DAILY_DISTRIBUTION_REPORTING_INTERVAL) || `0 0 18 * * *`,
    monthlyDistributionReportingInterval: (env.MONTHLY_DISTRIBUTION_REPORTING_INTERVAL) || `0 0 10 1 * *`,
    statsComputationInterval: (env.STATS_COMPUTATION_INTERVAL && Number(env.STATS_COMPUTATION_INTERVAL)) || 1,
    googleClientId: env.GOOGLE_CLIENT_ID,
    sendgridApiKey: env.SENDGRID_API_KEY || '',
    bitlyApiKey: env.BITLY_API_KEY || '',
    bitlyApiLink: env.BITLY_API_LINK || 'https://api-ssl.bitly.com/v4/shorten',
    emailSender: env.EMAIL_SENDER || 's'
  };
}
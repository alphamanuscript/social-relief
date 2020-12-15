import { AppConfig, App } from './app';
import { Users } from './user';
import { Transactions, PaymentProviders, AtPaymentProvider, ManualPaymentProvider, FlutterwavePaymentProvider } from './payment';
import { MongoClient } from 'mongodb';
import { createDbConnectionFailedError } from './error';
import { DonationDistributions } from './distribution';
import { SystemLocks } from './system-lock';
import { AtSmsProvider } from './sms';
import { SendGridEmailProvider } from './email';
import { Invitations } from './invitation';
import { EventBus } from './event';
import { UserNotifications } from './user-notification';
import { Statistics } from './stat';
import { DistributionReports } from './distribution-report';
import { Links, BitlyLinkShortener } from './link-generator';
import { BulkMessages, DefaultMessageContextFactory } from './bulk-messaging';
import { PhoneVerification } from './phone-verification';

export async function bootstrap(config: AppConfig): Promise<App> {
  const client = await getDbConnection(config.dbUri);
  const db = client.db(config.dbName);
  const eventBus = new EventBus();

  const atPaymentProvider = new AtPaymentProvider({
    username: config.atUsername,
    apiKey: config.atApiKey,
    paymentsProductName: config.atPaymentsProductName,
    paymentsProviderChannel: config.atPaymentsProviderChannel
  });

  const flwPaymentProvider = new FlutterwavePaymentProvider({
    secretKey: config.flutterwaveSecretKey,
    redirectUrl: config.flutterwaveRedirectUrl,
    logoUrl: config.flutterwaveLogoUrl
  });

  const manualPayProvider = new ManualPaymentProvider({
    baseUrl: config.manualPayBaseUrl
  });

  const paymentProviders = new PaymentProviders();
  paymentProviders.register(atPaymentProvider);
  paymentProviders.register(flwPaymentProvider);
  paymentProviders.register(manualPayProvider);
  paymentProviders.setPreferredForReceiving(flwPaymentProvider.name());
  paymentProviders.setPreferredForSending(flwPaymentProvider.name());
  paymentProviders.setPreferredForRefunds(manualPayProvider.name());

  const systemLocks = new SystemLocks(db);
  const transactions = new Transactions(db, { paymentProviders, eventBus });
  const invitations = new Invitations(db);
  const users = new Users(db, {
    transactions,
    invitations,
    eventBus,
    systemLocks
  });
  
  const donationDistributions = new DonationDistributions(db, {
    users,
    systemLocks,
    periodLength: config.distributionPeriodLength,
    periodLimit: config.distributionPeriodLimit
  });
  const smsProvider = new AtSmsProvider({
    username: config.atUsername,
    apiKey: config.atApiKey,
    sender: config.atSmsSender
  });
  
  const emailProvider = new SendGridEmailProvider({
    apiKey: config.sendgridApiKey,
    emailSender: config.emailSender
  });

  // starts listening to events when instantiated
  new UserNotifications({
    smsProvider,
    emailProvider,
    eventBus,
    users,
    webappBaseUrl: config.webappBaseUrl
  });

  const stats = new Statistics(db);

  const bitly = new BitlyLinkShortener({ apiKey: config.bitlyApiKey, apiLink: config.bitlyApiLink });

  const links = new Links({ baseUrl: config.webappBaseUrl, shortener: bitly });

  const distributionReports = new DistributionReports(db, {
    smsProvider,
    emailProvider,
    users,
    transactions,
    links
  });

  const phoneVerification = new PhoneVerification(db, { 
    smsProvider,
    users,
    links,
    eventBus
  });

  const messageContextFactory = new DefaultMessageContextFactory({
    baseUrl: config.webappBaseUrl,
    linkGenerator: links
  });

  const bulkMessages = new BulkMessages({
    users,
    smsProvider,
    contextFactory: messageContextFactory
  });

  await users.createIndexes();
  await transactions.createIndexes();
  await invitations.createIndexes();
  await phoneVerification.createIndexes();

  return {
    users,
    transactions,
    invitations,
    donationDistributions,
    phoneVerification,
    stats,
    distributionReports,
    bulkMessages
  };
}

async function getDbConnection(connectionUrl: string) {
  try {
    const client = await MongoClient.connect(connectionUrl, { useUnifiedTopology: true });
    return client;
  }
  catch (e)
  {
    throw createDbConnectionFailedError(e.message);
  }
}

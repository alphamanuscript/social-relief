import { AppConfig, App } from './app';
import { Users } from './user';
import { Transactions, PaymentProviders, AtPaymentProvider, ManualPaymentProvider, FlutterwavePaymentProvider } from './payment';
import { MongoClient } from 'mongodb';
import { createDbConnectionFailedError } from './error';
import { DonationDistributions } from './distribution';
import { SystemLocks } from './system-lock';
import { AtSMSProvider } from './sms';
import { Invitations } from './invitation';
import { EventBus } from './event';

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
  paymentProviders.setPreferredForSending(manualPayProvider.name());

  const systemLocks = new SystemLocks(db);
  const transactions = new Transactions(db, { paymentProviders });
  const invitations = new Invitations(db);
  const users = new Users(db, {
    transactions,
    invitations
  });
  const donationDistributions = new DonationDistributions(db, {
    users,
    systemLocks,
    periodLength: config.distributionPeriodLength,
    periodLimit: config.distributionPeriodLimit
  });
  const smsProvider = new AtSMSProvider({
    username: config.atUsername,
    apiKey: config.atApiKey,
  });

  await users.createIndexes();
  await transactions.createIndexes();
  await invitations.createIndexes();

  return {
    users,
    transactions,
    invitations,
    donationDistributions,
    smsProvider
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
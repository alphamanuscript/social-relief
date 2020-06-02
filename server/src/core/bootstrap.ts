import { AppConfig, App } from './app';
import { Users } from './user';
import { Transactions, AtPaymentProvider } from './payment';
import { MongoClient } from 'mongodb';
import { createDbConnectionFailedError } from './error';
import { DonationDistributions } from './distribution';
import { SystemLocks } from './system-lock';

export async function bootstrap(config: AppConfig): Promise<App> {
  const client = await getDbConnection(config.dbUri);
  const db = client.db(config.dbName);

  const paymentProvider = new AtPaymentProvider({
    username: config.atUsername,
    apiKey: config.atApiKey,
    paymentsProductName: config.atPaymentsProductName,
    paymentsProviderChannel: config.atPaymentsProviderChannel
  });
  const systemLocks = new SystemLocks(db);
  const transactions = new Transactions(db, { paymentProvider });
  const users = new Users(db, {
    transactions,
  });
  const donationDistributions = new DonationDistributions(db, {
    users,
    systemLocks,
    periodLength: config.distributionPeriodLength,
    periodLimit: config.distributionPeriodLimit
  });

  await users.createIndexes();
  await transactions.createIndexes();

  return {
    users,
    transactions,
    donationDistributions
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
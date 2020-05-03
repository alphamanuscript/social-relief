import { AppConfig, App } from './app';
import { Users } from './user';
import { Transactions, AtPaymentProvider } from './payment';
import { MongoClient } from 'mongodb';
import { throwAppError } from './error';

export async function bootstrap(config: AppConfig): Promise<App> {
  const client = await getDbConnection(config.dbUri);
  const db = client.db(config.dbName);

  const paymentProvider = new AtPaymentProvider({
    username: config.atUsername,
    apiKey: config.atApiKey,
    paymentsProductName: config.atPaymentsProductName,
    paymentsProviderChannel: config.atPaymentsProviderChannel
  });
  const transactions = new Transactions(db, { paymentProvider });
  const users = new Users(db, {
    transactions,
  });

  await users.createIndexes();
  await transactions.createIndexes();

  return {
    users,
    transactions
  };
}

async function getDbConnection(connectionUrl: string) {
  try {
    const client = await MongoClient.connect(connectionUrl);
    return client;
  }
  catch (e)
  {
    throwAppError(e.message, 'dbConnectionFailed');
  }
}
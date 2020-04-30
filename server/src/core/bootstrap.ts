import { AppConfig, App } from './app';
import { Users } from './user';
import { Transactions } from './transaction';
import { Payments } from './payment';
import { MongoClient } from 'mongodb';
import { throwAppError } from './error';

export async function bootstrap(config: AppConfig): Promise<App> {
  const client = await getDbConnection(config.dbUri);
  const db = client.db(config.dbName);

  const payments = new Payments();
  const transactions = new Transactions(db);
  const users = new Users(db, {
    transactions,
    payments
  });
  await users.createIndexes();

  return {
    users
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
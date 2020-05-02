import { Db, Collection } from 'mongodb';
import { Transaction, TransactionCreateArgs, TransactionService, PaymentProvider, InitiateDonationArgs } from './types';
import { generateId } from '../util';
import { createDbOpFailedError, AppError } from '../error';
import { User } from '../user';

const COLLECTION = 'transactions';

export interface TransactionsArgs {
  paymentProvider: PaymentProvider;
}

export class Transactions implements TransactionService {
  private db: Db;
  private collection: Collection<Transaction>;
  private provider: PaymentProvider;

  constructor(db: Db, args: TransactionsArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.provider = args.paymentProvider;
  }

  async initiateDonation(user: User, args: InitiateDonationArgs): Promise<Transaction> {
    const trxArgs: TransactionCreateArgs = {
      amount: args.amount,
      to: user._id,
      from: '',
      fromExternal: true,
      toExternal: false,
      type: 'donation',
      provider: this.provider.name()
    };

    try {
      const requestResult = await this.provider.requestPaymentFromUser(user, args.amount);
      trxArgs.providerTransactionId = requestResult.providerTransactionId;
      trxArgs.status = requestResult.status;
      const result = await this.create(trxArgs);
      return result;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  private async create(args: TransactionCreateArgs): Promise<Transaction> {
    const now = new Date();
    const tx: Transaction = {
      _id: generateId(),
      ...args,
      providerTransactionId: args.providerTransactionId || '',
      status: args.status || 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: {}
    };

    try {
      const res = await this.collection.insertOne(tx);
      return res.ops[0];
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }
}
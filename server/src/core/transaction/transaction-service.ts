import { Db, Collection } from 'mongodb';
import { Transaction, TransactionCreateArgs, TransactionService } from './types';
import { generateId } from '../util';
import { createDbOpFailedError } from '../error';

const COLLECTION = 'transactions';

export class Transactions implements TransactionService {
  private db: Db;
  private collection: Collection<Transaction>;

  constructor(db: Db) {
    this.db = db;
    this.collection = db.collection(COLLECTION);
  }

  async create(args: TransactionCreateArgs): Promise<Transaction> {
    const now = new Date();
    const tx: Transaction = {
      _id: generateId(),
      ...args,
      status: 'pending',
      createdAt: now,
      updatedAt: now
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
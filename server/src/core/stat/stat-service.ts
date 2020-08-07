import { Db, Collection } from 'mongodb';
import { createDbOpFailedError, rethrowIfAppError, createResourceNotFoundError } from '../error';
import { generateId } from '../util';
import * as messages from '../messages';
import { UserService }  from '../user';
import { TransactionService } from '../payment';
import { StatService, DbStat, StatsArgs, Stat, StatCreateArgs, StatUpdateArgs } from './types';

const COLLECTION = 'stats';
export class Stats implements StatService {
  private db: Db;
  private collection: Collection<DbStat>;
  private users: UserService;
  private transactions: TransactionService;

  constructor(db: Db, args: StatsArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.users = args.users;
    this.transactions = args.transactions;
    // Compute and/or update stats every 5 minutes 
    let intervalId = setInterval(this.compute, 5 * 60 * 1000);
  }

  private async create(args: StatCreateArgs): Promise<Stat> {
    const now = new Date();
    const stat: DbStat = {
      _id: 'stats',
      numContributors: args.numContributors,
      totalContributed: args.totalContributed,
      numBeneficiaries: args.numBeneficiaries,
      totalDistributed: args.totalDistributed,
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await this.collection.insertOne(stat);
      return res.ops[0];
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async get(): Promise<Stat> {
    try {
      const stats = await this.collection.findOne({ _id: 'stats' });
      return stats;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async update(args: StatUpdateArgs): Promise<Stat> {
    const { numContributors, totalContributed, numBeneficiaries, totalDistributed } = args;
    try {
      const updatedStats = await this.collection.findOneAndUpdate(
        { _id: 'stats' },
        { 
          $set: { numContributors, totalContributed, numBeneficiaries, totalDistributed },
          $currentDate: { updatedAt: true },
        },
        { upsert: true, returnOriginal: false }
      );

      if (!updatedStats) throw createResourceNotFoundError(messages.ERROR_STAT_NOT_FOUND);
      return updatedStats.value;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async compute(): Promise<void> {
    // TODO
  }
}

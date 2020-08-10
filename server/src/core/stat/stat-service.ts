import { Db, Collection } from 'mongodb';
import { createDbOpFailedError, rethrowIfAppError, createResourceNotFoundError } from '../error';
import { generateId } from '../util';
import * as messages from '../messages';
import { UserService }  from '../user';
import { TransactionService } from '../payment';
import { StatsService, StatsArgs, Stats, StatsCreateArgs, StatsUpdateArgs } from './types';

const COLLECTION = 'stats';
export class Statistics implements StatsService {
  private db: Db;
  private collection: Collection<Stats>;
  private users: UserService;
  private transactions: TransactionService;

  constructor(db: Db, args: StatsArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.users = args.users;
    this.transactions = args.transactions;
    this.create();
  }

  private async create(): Promise<Stats> {
    const stats = await this.get();
    if (!stats) {
      const now = new Date();
      const stat: Stats = {
        _id: 'stats',
        numContributors: 0,
        totalContributed: 0,
        numBeneficiaries: 0,
        totalDistributed: 0,
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
    else return stats;
  }

  async get(): Promise<Stats> {
    try {
      const stats = await this.collection.findOne({ _id: 'stats' });
      return stats;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async update(): Promise<Stats> {
    try {
      const numContributorsRes = await this.users.aggregate([
        { $match: { roles: { $in: ['donor'] } } },
        { $count: 'numContributors' }
      ]);

      const numBeneficiariesRes = await this.users.aggregate([
        { $match: { roles: { $in: ['beneficiary'] } } },
        { $count: 'numBeneficiaries' }
      ]);

      const totalContributedRes = await this.transactions.aggregate([
        { $match: { type: 'donation', status: 'success' } },
        { $project: { _id: 0, totalContributed: { $sum: "$amount" } } }
      ]);

      const totalDistributedRes = await this.transactions.aggregate([
        { $match: { type: 'distribution', status: 'success' } },
        { $project: { _id: 0, totalDistributed: { $sum: "$amount" } } }
      ]);

      const numContributors = numContributorsRes.length ? numContributorsRes[0].numContributors : 0;
      const numBeneficiaries = numBeneficiariesRes.length ? numBeneficiariesRes[0].numBeneficiaries : 0;
      const totalContributed = totalContributedRes.length ? totalContributedRes[0].totalContributed : 0;
      const totalDistributed = totalDistributedRes.length ? totalDistributedRes[0].totalDistributed : 0;

      const updatedStats = await this.collection.findOneAndUpdate(
        { _id: 'stats' },
        { 
          $set: { numContributors, totalContributed, numBeneficiaries, totalDistributed },
          $currentDate: { updatedAt: true },
        },
        { upsert: true, returnOriginal: false }
      );

      if (!updatedStats) throw createResourceNotFoundError(messages.ERROR_STATS_NOT_FOUND);
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

import { Db, Collection } from 'mongodb';
import { createDbOpFailedError, rethrowIfAppError, createResourceNotFoundError } from '../error';
import { generateId } from '../util';
import * as messages from '../messages';
import { UserService }  from '../user';
import { TransactionService } from '../payment';
import { StatsService, StatsArgs, Stats } from './types';

const COLLECTION = 'stats';
export class Statistics implements StatsService {
  private db: Db;
  private collection: Collection<Stats>;
  private transactions: TransactionService;

  constructor(db: Db, args: StatsArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
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
      const res = await this.transactions.aggregate([
        {
          $facet: {
            numContributorsPipeline: [
              { $match: { type: 'donation', status: 'success'} },
              { $group: { _id: "$to" } },
              { $count: 'numContributors' }
            ],
            numBeneficiariesPipeline: [
              { $match: { type: 'distribution', status: 'success'} },
              { $group: { _id: "$to" } },
              { $count: 'numBeneficiaries' }
            ],
            totalContributedPipeline: [
              { $match: { type: 'donation', status: 'success' } },
              { $group: { _id: null, totalContributed: { $sum: "$amount" } } },
              { $project: { _id: 0, totalContributed: 1 } }
            ],
            totalDistributedPipeline: [
              { $match: { type: 'distribution', status: 'success' } },
              { $group: { _id: null, totalDistributed: { $sum: "$amount" } } },
              { $project: { _id: 0, totalDistributed: 1 } }
            ],
          }
        }
      ]);

      let numContributors = 0;
      let numBeneficiaries = 0;
      let totalContributed = 0;
      let totalDistributed = 0;

      if (res.length) {
        numContributors = res[0].numContributorsPipeline.length ? res[0].numContributorsPipeline[0].numContributors : 0;
        numBeneficiaries = res[0].numBeneficiariesPipeline.length ? res[0].numBeneficiariesPipeline[0].numBeneficiaries : 0;
        totalContributed = res[0].totalContributedPipeline.length ? res[0].totalContributedPipeline[0].totalContributed : 0;
        totalDistributed = res[0].totalDistributedPipeline.length ? res[0].totalDistributedPipeline[0].totalDistributed : 0;
      }

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
}

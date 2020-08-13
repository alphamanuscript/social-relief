import { Db, Collection } from 'mongodb';
import { createDbOpFailedError, rethrowIfAppError, createAppError, ErrorCode } from '../error';
import * as messages from '../messages';
import { TransactionService } from '../payment';
import { StatsService, Stats } from './types';

const COLLECTION = 'stats';

export interface StatsArgs {
  transactions: TransactionService
}

export class Statistics implements StatsService {
  private db: Db;
  private collection: Collection<Stats>;
  private transactions: TransactionService;

  constructor(db: Db, args: StatsArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.transactions = args.transactions;
  }

  async get(): Promise<Stats> {
    try {
      let stats = await this.collection.findOne({ _id: 'stats' });
      if (!stats) {
        stats = await this.update(); 
      } 
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

      if (!updatedStats) throw createAppError(messages.ERROR_SERVER_ERROR, 'serverError');
      return updatedStats.value;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }
}

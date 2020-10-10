import { Db, Collection } from 'mongodb';
import { createDbOpFailedError, rethrowIfAppError, createAppError, ErrorCode } from '../error';
import * as messages from '../messages';
import { COLLECTION as TRX_COLLECTION } from '../payment';
import { COLLECTION as USERS_COLLECTION } from '../user';
import { StatsService, Stats } from './types';

const COLLECTION = 'stats';


export class Statistics implements StatsService {
  private db: Db;
  private collection: Collection<Stats>;

  constructor(db: Db) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
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
      const res = await this.db.collection(TRX_COLLECTION).aggregate([
        {
          $facet: {
            numContributorsPipeline: [
              { $match: { type: 'donation', status: 'success'} },
              { $group: { _id: "$to" } },
              { $count: 'numContributors' }
            ],
            numRecipientsPipeline: [
              { $match: { type: 'distribution', status: 'success'} },
              { $group: { _id: "$to" } },
              { $count: 'numRecipients' }
            ],
            totalContributedPipeline: [
              { 
                $match: {
                  $or: [
                    { type: 'donation', status: 'success' },
                    { type: 'refund', status: 'success' }
                  ]
                }
              },
              {
                $group: {
                  _id: { $cond: { if: { $eq: ['$type', 'donation'] }, then: 1, else: -1 } },
                  total: { $sum: "$amount" }
                }
              },
              {
                $group: { _id: null, totalContributed: { $sum: { $multiply: ['$_id', '$total'] } } }
              },
              { $project: { _id: 0, totalContributed: 1 } }
            ],
            totalDistributedPipeline: [
              { $match: { type: 'distribution', status: 'success' } },
              { $group: { _id: null, totalDistributed: { $sum: "$amount" } } },
              { $project: { _id: 0, totalDistributed: 1 } }
            ],
          }
        }
      ]).toArray();

      let numContributors = 0;
      let numRecipients = 0;
      let totalContributed = 0;
      let totalDistributed = 0;

      if (res.length) {
        numContributors = res[0].numContributorsPipeline.length ? res[0].numContributorsPipeline[0].numContributors : 0;
        numRecipients = res[0].numRecipientsPipeline.length ? res[0].numRecipientsPipeline[0].numRecipients : 0;
        totalContributed = res[0].totalContributedPipeline.length ? res[0].totalContributedPipeline[0].totalContributed : 0;
        totalDistributed = res[0].totalDistributedPipeline.length ? res[0].totalDistributedPipeline[0].totalDistributed : 0;
      }

      const beneficiariesRes = await this.db.collection(USERS_COLLECTION).aggregate([
        { $match: { roles: 'beneficiary'} },
        { $group: { _id: null, total: { $sum: 1 } } }
      ]).toArray();

      const numBeneficiaries = beneficiariesRes.length ? beneficiariesRes[0].total : 0;

      const updatedStats = await this.collection.findOneAndUpdate(
        { _id: 'stats' },
        { 
          $set: { numContributors, totalContributed, numRecipients, totalDistributed, numBeneficiaries },
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

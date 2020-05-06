import { Db, Collection } from 'mongodb';
import { DonationDistributionService, DonationDistributionResults, DonationDistributionArgs } from './types';
import { Distributor } from './distributor';
import { generateId } from '../util';
import { AppError, createAppError } from '../error';

const COLLECTION = 'donation_distributions';

export class DonationDistributions implements DonationDistributionService {
  private db: Db;
  private collection: Collection<DonationDistributionResults>;
  private args: DonationDistributionArgs;

  constructor(db: Db, args: DonationDistributionArgs) {
    this.db = db;
    this.collection = db.collection(COLLECTION);
    this.args = args;
  }

  async distributionDonations(): Promise<DonationDistributionResults> {
    try {
      const startedAt = new Date();
      const distributor = new Distributor(this.db, this.args);
      const distributions = await distributor.run();
      const finishedAt = new Date();

      const results: DonationDistributionResults = {
        _id: generateId(),
        startedAt,
        finishedAt,
        distributions
      };

      const opResult = await this.collection.insertOne(results);
      return opResult.ops[0];
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createAppError(e.message, 'dbOpFailed');
    }
  }
}
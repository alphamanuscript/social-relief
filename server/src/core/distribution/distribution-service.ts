import { Db, Collection } from 'mongodb';
import { DonationDistributionService, DonationDistributionResults, DonationDistributionArgs } from './types';
import { runDonationDistribution } from './run-distribution';
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

  async distributeDonations(onlyVettedBeneficiaries: boolean = false): Promise<DonationDistributionResults> {
    const lock = this.args.systemLocks.distribution();
    try {
      await lock.lock();
      const startedAt = new Date();
      const distributions = await runDonationDistribution(this.db, this.args, onlyVettedBeneficiaries);
      const finishedAt = new Date();

      const results: DonationDistributionResults = {
        _id: generateId(),
        onlyVettedBeneficiaries,
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
    finally {
      await lock.unlock();
    }
  }
}
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

  async distributeDonations(): Promise<DonationDistributionResults> {
    try {
      await this.args.systemLocks.distribution().lock();
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
      await this.args.systemLocks.distribution().unlock();
      return opResult.ops[0];
    }
    catch (e) {
      if (!(e instanceof AppError && e.code === 'systemLockLocked')) {
        // do not attempt to unlock if it was locked because we don't own the lock
        // TODO: we should probably refactor locks implementation to prevent unlocking
        // locks that we did not lock
        await this.args.systemLocks.distribution().unlock();
      }
      
      if (e instanceof AppError) throw e;
      throw createAppError(e.message, 'dbOpFailed');
    }
  }
}
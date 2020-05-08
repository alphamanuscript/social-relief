import { Db, Collection } from 'mongodb';
import { SystemLockService, SystemLock, SystemLockRecord } from './types';
import { SystemLockManager } from './system-lock';

const COLLECTION = 'system_locks';
const DISTRIBUTION_LOCK = 'donationDistributionLock';

export class SystemLocks implements SystemLockService {
  private collection: Collection<SystemLockRecord>;
  private distributionLock: SystemLock = null;
  
  constructor(private db: Db) {
    this.collection = this.db.collection(COLLECTION);
  }

  distribution(): SystemLock {
    if (!this.distributionLock) {
      this.distributionLock = new SystemLockManager(DISTRIBUTION_LOCK, this.collection);
    }

    return this.distributionLock;
  }

}

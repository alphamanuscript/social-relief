import { Db, Collection } from 'mongodb';
import { SystemLockService, SystemLock, SystemLockRecord } from './types';
import { SystemLockManager as SystemLockHandle } from './system-lock';
import { generateId } from '../util';

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
      this.distributionLock = new SystemLockHandle(DISTRIBUTION_LOCK, generateId(), this.collection);
    }

    return this.distributionLock;
  }

}

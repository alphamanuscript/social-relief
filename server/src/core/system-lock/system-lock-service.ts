import { Db, Collection } from 'mongodb';
import { SystemLockService, SystemLock, SystemLockRecord } from './types';
import { SystemLockHandle as SystemLockHandle } from './system-lock';

const COLLECTION = 'system_locks';
const DISTRIBUTION_LOCK = 'donationDistributionLock';

export class SystemLocks implements SystemLockService {
  private collection: Collection<SystemLockRecord>;
  
  constructor(private db: Db) {
    this.collection = this.db.collection(COLLECTION);
  }

  distribution(): SystemLock {
    return new SystemLockHandle(DISTRIBUTION_LOCK, this.collection);
  }

}

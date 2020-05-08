import { Db, Collection } from 'mongodb';
import { SystemLockService, SystemLock, SystemLockRecord } from './types';
import { createSystemLockBusyError, AppError, createDbOpFailedError, createSystemLockInvalidStateError } from '../error';
import * as messages from '../messages';

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
      this.distributionLock = createSystemLock(DISTRIBUTION_LOCK, this.collection);
    }

    return this.distributionLock;
  }

}

export function createSystemLock(id: string, collection: Collection<SystemLockRecord>): SystemLock {
  return {
    async lock() {
      try {
        const res = await collection.findOneAndUpdate(
          { _id: id, locked: { $ne: true } },
          { $set: { locked: true, updatedAt: new Date() } },
          { upsert: true });

        if (!res.ok) {
          throw createSystemLockBusyError();
        }
      }
      catch (e) {
        if (e instanceof AppError) throw e;
        if (e.code == 11000 && e.message.indexOf(id) >= 0) throw createSystemLockBusyError();
        throw createDbOpFailedError(e.message);
      }
    },
  
    async unlock() {
      try {
        const res = await collection.findOneAndUpdate(
          { _id: id, locked: true },
          { $set: { locked: false, updated: new Date() } });

        // TODO: It might not be necessary to throw an error when releasing a free lock
        // but releasing a free lock is an indication of logic error
        // If we don't throw an error, we should at least log a warning
        if (!res.value) throw createSystemLockInvalidStateError(messages.ERROR_ATTEMPT_TO_RELEASE_FREE_LOCK);
      }
      catch (e) {
        if (e instanceof AppError) throw e;
        throw createDbOpFailedError(e.message);
      }
    },
  
    async ensureUnlocked() {
      try {
        const res = await collection.findOne({ _id: id, locked: true });
        if (res) throw createSystemLockBusyError();
      }
      catch (e) {
        if (e instanceof AppError) throw e;
        throw createDbOpFailedError(e.message);
      }
    }
  };
}
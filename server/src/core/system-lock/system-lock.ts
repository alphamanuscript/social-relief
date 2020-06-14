import { Collection } from 'mongodb';
import { SystemLock, SystemLockRecord } from './types';
import { createSystemLockBusyError, AppError, createDbOpFailedError, createSystemLockInvalidStateError, isMongoDuplicateKeyError } from '../error';
import * as messages from '../messages';


// this is a bad name. We should just use a common prefix/suffix for interfaces
// to make it easier to name classes
export class SystemLockManager implements SystemLock {
  constructor(private id: string, private collection: Collection<SystemLockRecord>) {
  }
  
  async lock() {
    try {
      const res = await this.collection.findOneAndUpdate(
        { _id: this.id, locked: { $ne: true } },
        { $set: { locked: true, updatedAt: new Date() } },
        { upsert: true });

      if (!res.ok) {
        throw createSystemLockBusyError();
      }
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (isMongoDuplicateKeyError(e, this.id)) throw createSystemLockBusyError();
      throw createDbOpFailedError(e.message);
    }
  }

  async unlock() {
    try {
      const res = await this.collection.findOneAndUpdate(
        { _id: this.id, locked: true },
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
  }

  async ensureUnlocked() {
    try {
      const res = await this.collection.findOne({ _id: this.id, locked: true });
      if (res) throw createSystemLockBusyError();
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }
}
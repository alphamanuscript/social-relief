import { Collection } from 'mongodb';
import { SystemLock, SystemLockRecord } from './types';
import { createSystemLockBusyError, AppError, createDbOpFailedError, createSystemLockInvalidStateError } from '../error';
import * as messages from '../messages';
import { generateId } from '../util';


// this is a bad name. We should just use a common prefix/suffix for interfaces
// to make it easier to name classes
export class SystemLockManager implements SystemLock {
  private handleKey: string = null;

  constructor(private id: string, private collection: Collection<SystemLockRecord>) {
    this.handleKey = generateId();
  }
  
  async lock() {
    try {
      const res = await this.collection.findOneAndUpdate(
        { _id: this.id, locked: { $ne: true } },
        { $set: { key: this.handleKey, locked: true, updatedAt: new Date() } },
        { upsert: true });

      if (!res.ok) {
        throw createSystemLockBusyError();
      }
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      if (e.code == 11000 && e.message.indexOf(this.id) >= 0) throw createSystemLockBusyError();
      throw createDbOpFailedError(e.message);
    }
  }

  async unlock() {
    try {
      const res = await this.collection.findOneAndUpdate(
        { _id: this.id, key: this.handleKey, locked: true },
        { $set: { locked: false, updated: new Date() } });

    }
    catch (e) {
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
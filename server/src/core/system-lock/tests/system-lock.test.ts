import { createDbUtils } from '../../test-util';
import { systemLocks } from './fixtures';
import { SystemLockManager } from '../system-lock';

const DB = '_crowd_relief_system_lock_tests_';
const COLLECTION = 'system_locks';

describe('SystemLock tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  // beforeEach(async () => {
  //   await dbUtils.resetCollectionWith(systemLocks);
  // }, 10000);

  describe('lock', () => {
    beforeAll(async () => {
      await dbUtils.resetCollectionWith(systemLocks);
    }, 10000);

    test('should set locked:true on lock record', async () => {
      const lock = new SystemLockManager('lock2', dbUtils.getCollection());
      await lock.lock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(true);
    }, 10000);

    test('should create lock record with locked:true if record does not exist', async () => {
      const lock = new SystemLockManager('lock2', dbUtils.getCollection());
      await lock.lock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(true);
    }, 10000);

    test('should throw error if already locked', async () => {
      const lock = new SystemLockManager('lock2', dbUtils.getCollection());
      try {
        await lock.lock();
      }
      catch (e) {
        expect(e.code).toBe('systemLockLocked');
      }
    }, 10000);
  });

  describe('unlock', () => {
    beforeAll(async () => {
      await dbUtils.resetCollectionWith(systemLocks);
    }, 10000);

    test('should set locked to false if locked', async () => {
      const lock = new SystemLockManager('lock1', dbUtils.getCollection());
      const records = await dbUtils.getCollection().find({ }).toArray();
      console.log('In unlock records: ', records);
      await lock.lock();
      let record = await dbUtils.getCollection().findOne({ _id: 'lock1' });
      console.log('after lock record: ', record);
      expect(record.locked).toBe(true);
      await lock.unlock();
      record = await dbUtils.getCollection().findOne({ _id: 'lock1' });
      console.log('after unlock record: ', record);
      expect(record.locked).toBe(false);
    }, 10000);
    
    test('should not set locked to false if not locked', async () => {
      const lock = new SystemLockManager('lock2', dbUtils.getCollection());
      let record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(false);
      await lock.unlock();
      record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      // console.log('record: ', record);
      expect(record.locked).toBe(false);
    }, 10000);

    test('should throw dbOpFailed error if lock does not exist', async () => {
      await dbUtils.dropCollection();
      const lock = new SystemLockManager('lock2', dbUtils.getCollection());
      try {
        await lock.unlock();
      }
      catch (e) {
        expect(e.code).toBe('dbOpFailed');
      }
    }, 10000);
  });

  // describe('ensureUnlocked', () => {
  //   beforeEach(async () => {
  //     await dbUtils.resetCollectionWith(systemLocks);
  //   });

  //   test('should succeed if lock is not locked', async () => {
  //     const lock = new SystemLockManager('lock2', dbUtils.getCollection());
  //     await lock.ensureUnlocked();
  //     const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
  //     expect(record.locked).toBe(false);
  //   });

  //   test('should succeed if lock does not exist', async () => {
  //     await dbUtils.dropCollection();
  //     const lock = new SystemLockManager('lock2', dbUtils.getCollection());
  //     await lock.ensureUnlocked();
  //     const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
  //     expect(record).toBeFalsy();
  //   });

  //   test('should throw error if lock is locked', async () => {
  //     const lock = new SystemLockManager('lock1', dbUtils.getCollection());
  //     try {
  //       await lock.ensureUnlocked();
  //     }
  //     catch (e) {
  //       expect(e.code).toBe('systemLockLocked');
  //     }
  //   })
  // });
});

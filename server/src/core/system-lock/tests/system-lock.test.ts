import { createDbUtils } from '../../test-util';
import { systemLocks } from './fixtures';
import { SystemLockManager } from '../system-lock';
import { generateId } from '../../util';

const DB = '_crowd_relief_system_lock_tests_';
const COLLECTION = 'system_locks';

describe('SystemLock tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  }, 10000);

  afterAll(async () => {
    await dbUtils.tearDown();
  }, 10000);

  beforeEach(async () => {
    await dbUtils.resetCollectionWith(systemLocks);
  }, 10000);

  describe('lock', () => {
    test('should set locked:true on lock record', async () => {
      const key = generateId();
      const lock = new SystemLockManager('lock2', key, dbUtils.getCollection());
      await lock.lock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.key).toBe(key);
      expect(record.locked).toBe(true);
    }, 10000);

    test('should create lock record with locked:true if record does not exist', async () => {
      await dbUtils.dropCollection();
      const key = generateId()
      const lock = new SystemLockManager('lock2', key, dbUtils.getCollection());
      await lock.lock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(true);
    }, 10000);

    test('should throw error if already locked', async () => {
      const lock = new SystemLockManager('lock1', generateId(), dbUtils.getCollection());
      try {
        await lock.lock();
      }
      catch (e) {
        expect(e.code).toBe('systemLockLocked');
      }
    }, 10000);
  });

  describe('unlock', () => {
    test('should set locked to false if locked', async () => {
      const key = generateId()
      const lock = new SystemLockManager('lock3', key, dbUtils.getCollection());
      await lock.lock();
      await lock.unlock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock3' });
      expect(record.key).toBe(key);
      expect(record.locked).toBe(false);
    }, 10000);

    test('should not change lock state if already unlocked', async () => {
      await dbUtils.dropCollection();
      const lock = new SystemLockManager('lock2', generateId(), dbUtils.getCollection());
      await lock.lock();
      await lock.unlock()
      let record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(false);
      await lock.unlock();
      record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(false);
    }, 10000);
  });

  describe('ensureUnlocked', () => {
    test('should succeed if lock is not locked', async () => {
      const lock = new SystemLockManager('lock2', generateId(), dbUtils.getCollection());
      await lock.ensureUnlocked();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(false);
    }, 10000);

    test('should succeed if lock does not exist', async () => {
      await dbUtils.dropCollection();
      const lock = new SystemLockManager('lock2', generateId(), dbUtils.getCollection());
      await lock.ensureUnlocked();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record).toBeFalsy();
    }, 10000);

    test('should throw error if lock is locked', async () => {
      const lock = new SystemLockManager('lock1', generateId(), dbUtils.getCollection());
      try {
        await lock.ensureUnlocked();
      }
      catch (e) {
        expect(e.code).toBe('systemLockLocked');
      }
    }, 10000);
  });
});
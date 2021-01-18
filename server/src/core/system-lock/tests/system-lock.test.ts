import { createDbUtils } from '../../test-util';
import { systemLocks } from './fixtures';
import { SystemLockHandle } from '../system-lock';
import { generateId } from '../../util';

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

  beforeEach(async () => {
    await dbUtils.resetCollectionWith(systemLocks);
  });

  describe('when creating a new instance', () => {
    test('auto-generates unique key by default', async () => {
      const lock1 = new SystemLockHandle('someLock', dbUtils.getCollection());
      const lock2 = new SystemLockHandle('someLock', dbUtils.getCollection());
      expect(lock1.getKey()).not.toEqual(lock2.getKey());
    });

    test('creates lock with specified key', async () => {
      const key = generateId();
      const lock = new SystemLockHandle('someLock', dbUtils.getCollection(), key);
      expect(lock.getKey).toEqual(key);
    });
  });

  describe('lock', () => {
    test('should set locked:true on lock record and lock with specified key', async () => {
      const lock = new SystemLockHandle('lock2', dbUtils.getCollection(), 'someKey');
      await lock.lock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(true);
      expect(record.lockedWithKey).toBe('someKey');
    });

    test('should create lock record with locked:true if record does not exist', async () => {
      await dbUtils.dropCollection();
      const lock = new SystemLockHandle('lock2', dbUtils.getCollection(), 'anotherKey');
      await lock.lock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(true);
      expect(record.lockedWithKey).toBe('anotherKey');
    });

    test('should throw error if already locked and enabled', async () => {
      const lock = new SystemLockHandle('lock1', dbUtils.getCollection());
      try {
        await lock.lock();
      }
      catch (e) {
        expect(e.code).toBe('systemLockLocked');
      }
    });

    test('should throw error if unlocked but disabled', async () => {
      const lock = new SystemLockHandle('lock3', dbUtils.getCollection());
      try {
        await lock.lock();
      }
      catch (e) {
        expect(e.code).toBe('systemLockDisabled');
      }
    });
  });

  describe('unlock', () => {
    test('should set locked to false if locked with matching key', async () => {
      const lock = new SystemLockHandle('lock1', dbUtils.getCollection(), 'lock1Key');
      await lock.unlock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock1' });
      expect(record.locked).toBe(false);
      expect(record.lockedWithKey).toBe('');
    });
    
    test('should not change lock state if already unlocked', async () => {
      const lock = new SystemLockHandle('lock2', dbUtils.getCollection());
      await lock.unlock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(false);
    });

    test('should not change lock state if locked with another key', async () => {
      const lock = new SystemLockHandle('lock1', dbUtils.getCollection(), 'anotherKey');
      await lock.unlock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock1' });
      expect(record.locked).toBe(true);
      expect(record.lockedWithKey).toBe('lock1Key');
    });

    test('should do nothing if lock does not exist', async () => {
      await dbUtils.dropCollection();
      const lock = new SystemLockHandle('lock2', dbUtils.getCollection());
      await lock.unlock();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record).toBeFalsy();
    });
  });

  describe('ensureUnlocked', () => {
    test('should succeed if lock is not locked', async () => {
      const lock = new SystemLockHandle('lock2', dbUtils.getCollection());
      await lock.ensureUnlocked();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record.locked).toBe(false);
    });

    test('should succeed if lock does not exist', async () => {
      await dbUtils.dropCollection();
      const lock = new SystemLockHandle('lock2', dbUtils.getCollection());
      await lock.ensureUnlocked();
      const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
      expect(record).toBeFalsy();
    });

    test('should throw error if lock is locked', async () => {
      const lock = new SystemLockHandle('lock1', dbUtils.getCollection());
      try {
        await lock.ensureUnlocked();
      }
      catch (e) {
        expect(e.code).toBe('systemLockLocked');
      }
    })
  });
});

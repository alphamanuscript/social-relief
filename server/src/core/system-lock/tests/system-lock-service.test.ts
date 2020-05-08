import { createDbUtils } from '../../test-util';
import { systemLocks } from './fixtures';
import { createSystemLock } from '../system-lock-service';

const DB = '_system_locks_tests_';
const COLLECTION = 'system_locks';

describe('SystemLockService tests', () => {
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

  describe('SystemLock', () => {
    describe('lock', () => {
      test('should set locked:true on lock record', async () => {
        const lock = createSystemLock('lock2', dbUtils.getCollection());
        await lock.lock();
        const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
        expect(record.locked).toBe(true);
      });

      test('should create lock record with locked:true if record does not exist', async () => {
        await dbUtils.dropCollection();
        const lock = createSystemLock('lock2', dbUtils.getCollection());
        await lock.lock();
        const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
        expect(record.locked).toBe(true);
      });

      test('should throw error if already locked', async () => {
        const lock = createSystemLock('lock1', dbUtils.getCollection());
        try {
          await lock.lock();
        }
        catch (e) {
          expect(e.code).toBe('systemLockLocked');
        }
      });
    });

    describe('unlock', () => {
      test('should set locked to false if locked', async () => {
        const lock = createSystemLock('lock1', dbUtils.getCollection());
        await lock.unlock();
        const record = await dbUtils.getCollection().findOne({ _id: 'lock1' });
        expect(record.locked).toBe(false);
      });
      
      test('should throw invalid state error if not locked', async () => {
        const lock = createSystemLock('lock2', dbUtils.getCollection());
        try {
          await lock.unlock();
        }
        catch (e) {
          expect(e.code).toBe('systemLockInvalidState');
        }
      });

      test('should throw invalid state error if lock does not exist', async () => {
        await dbUtils.dropCollection();
        const lock = createSystemLock('lock2', dbUtils.getCollection());
        try {
          await lock.unlock();
        }
        catch (e) {
          expect(e.code).toBe('systemLockInvalidState');
        }
      });
    });

    describe('ensureUnlocked', () => {
      test('should succeed if lock is not locked', async () => {
        const lock = createSystemLock('lock2', dbUtils.getCollection());
        await lock.ensureUnlocked();
        const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
        expect(record.locked).toBe(false);
      });

      test('should succeed if lock does not exist', async () => {
        await dbUtils.dropCollection();
        const lock = createSystemLock('lock2', dbUtils.getCollection());
        await lock.ensureUnlocked();
        const record = await dbUtils.getCollection().findOne({ _id: 'lock2' });
        expect(record).toBeFalsy();
      });

      test('should throw error if lock is locked', async () => {
        const lock = createSystemLock('lock1', dbUtils.getCollection());
        try {
          await lock.ensureUnlocked();
        }
        catch (e) {
          expect(e.code).toBe('systemLockLocked');
        }
      })
    });
  });
});

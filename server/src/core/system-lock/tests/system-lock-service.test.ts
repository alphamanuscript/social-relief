import { createDbUtils, expectAsyncAppError, expectNoAsyncAppError } from '../../test-util';
import { SystemLocks } from '../system-lock-service';

const DB = '_system_lock_service_tests_';
const COLLECTION = 'system_locks';

describe('SystemLockService tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  }, 10000);

  afterAll(async () => {
    await dbUtils.tearDown();
  }, 10000);

  describe('distribution lock', () => {
    test('distribution lock', async () => {
      const locks = new SystemLocks(dbUtils.getDb());

      const lock = await locks.distribution();
      lock.ensureUnlocked();
      await expectNoAsyncAppError(() => lock.unlock());

      await lock.lock();
      // can't lock a lock that's already locked
      await expectAsyncAppError(() => lock.lock(), 'systemLockLocked');
      await expectAsyncAppError(() => lock.ensureUnlocked(), 'systemLockLocked');

      await lock.unlock();
      await expectNoAsyncAppError(() => lock.unlock());
      await lock.ensureUnlocked();

      // repeating the same scenarios just to be sure it works :)
      await lock.ensureUnlocked();
      await expectNoAsyncAppError(() => lock.unlock());
      await lock.lock();
      await expectAsyncAppError(() => lock.lock(), 'systemLockLocked');
      await expectAsyncAppError(() => lock.ensureUnlocked(), 'systemLockLocked');
      await lock.unlock();
      await expectNoAsyncAppError(() => lock.unlock());
      await lock.ensureUnlocked();
    }, 10000);
  });
});
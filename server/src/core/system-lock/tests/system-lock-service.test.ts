import { createDbUtils, expectAsyncAppError } from '../../test-util';
import { SystemLocks } from '../system-lock-service';

const DB = '_system_lock_service_tests_';
const COLLECTION = 'system_locks';

describe('SystemLockService tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  describe('distribution lock', () => {
    test('distribution lock', async () => {
      const locks = new SystemLocks(dbUtils.getDb());

      const distLock1 = locks.distribution();
      const distLock2 = locks.distribution();

      await distLock1.ensureUnlocked();
      // unlocking a lock that's already unlocked does nothing
      await distLock1.unlock();

      await distLock1.lock();
      // can't lock a lock that's already locked
      await expectAsyncAppError(() => distLock1.lock(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock2.lock(), 'systemLockLocked');
      // ensure unlocked fails if lock is locked
      await expectAsyncAppError(() => distLock1.ensureUnlocked(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock2.ensureUnlocked(), 'systemLockLocked');

      // unlocking using the wrong handle does not unlock
      await distLock2.unlock();
      await expectAsyncAppError(() => distLock2.ensureUnlocked(), 'systemLockLocked');

      // we can only unlock using the handle that locked the key, i.e. distLock1
      await distLock1.unlock();
      await distLock1.ensureUnlocked();
      await distLock2.ensureUnlocked();

      // now that the lock is free, distLock2 is abl to acquire the lock
      await distLock2.lock();
      await expectAsyncAppError(() => distLock2.ensureUnlocked(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock1.ensureUnlocked(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock1.lock(), 'systemLockLocked');

      await distLock2.unlock();

      // repeating the same scenarios just to be sure it works :)
      await distLock1.ensureUnlocked();
      await distLock1.unlock();
      await distLock1.lock();
      await expectAsyncAppError(() => distLock1.lock(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock2.lock(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock1.ensureUnlocked(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock2.ensureUnlocked(), 'systemLockLocked');
      await distLock2.unlock();
      await expectAsyncAppError(() => distLock2.ensureUnlocked(), 'systemLockLocked');
      await distLock1.unlock();
      await distLock1.ensureUnlocked();
      await distLock2.ensureUnlocked();
      await distLock2.lock();
      await expectAsyncAppError(() => distLock2.ensureUnlocked(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock1.ensureUnlocked(), 'systemLockLocked');
      await expectAsyncAppError(() => distLock1.lock(), 'systemLockLocked');
      await distLock2.unlock();

      // disabling a handle that's unlocked
      await distLock1.disable();

      // disabling a handle that's already disabled
      await distLock1.disable();

      // locking a handle that's disabled
      await distLock1.lock();

      // disabling a handle that's locked
      await expectAsyncAppError(() => distLock1.disable(), 'systemLockDisabled');
    });
  });
});
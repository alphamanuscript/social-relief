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

      await locks.distribution().ensureUnlocked();
      // can't unlocking lock that's not locked
      await expectAsyncAppError(() => locks.distribution().unlock(), 'systemLockInvalidState');

      await locks.distribution().lock();
      // can't lock a lock that's already locked
      await expectAsyncAppError(() => locks.distribution().lock(), 'systemLockLocked');
      await expectAsyncAppError(() => locks.distribution().ensureUnlocked(), 'systemLockLocked');

      await locks.distribution().unlock();
      await expectAsyncAppError(() => locks.distribution().unlock(), 'systemLockInvalidState');
      await locks.distribution().ensureUnlocked();

      // repeating the same scenarios just to be sure it works :)
      await locks.distribution().ensureUnlocked();
      await expectAsyncAppError(() => locks.distribution().unlock(), 'systemLockInvalidState');
      await locks.distribution().lock();
      await expectAsyncAppError(() => locks.distribution().lock(), 'systemLockLocked');
      await expectAsyncAppError(() => locks.distribution().ensureUnlocked(), 'systemLockLocked');
      await locks.distribution().unlock();
      await expectAsyncAppError(() => locks.distribution().unlock(), 'systemLockInvalidState');
      await locks.distribution().ensureUnlocked();
    });
  });
});
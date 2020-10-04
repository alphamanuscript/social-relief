import { createDbUtils, expectAsyncAppError } from '../../test-util';
import { UserService } from '../../user';
import { DonationDistributions } from '../distribution-service';
import { users, transactions } from './fixtures';
import { DonationDistributionResults } from '../types';
import { SystemLocks, SystemLockService } from '../../system-lock';

const DB = '_crowd_relief_distribution_service_tests_';
const COLL = 'donation_distributions';
const USERS_COLL = 'users';
const TRANSACTIONS_COLL = 'transactions';

describe('DonationDistributionService tests', () => {
  const dbUtils = createDbUtils(DB, COLL);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  beforeEach(async () => {
    await Promise.all([
      dbUtils.resetCollectionWith(transactions, TRANSACTIONS_COLL),
      dbUtils.resetCollectionWith(users, USERS_COLL)
    ]);
  });

  describe('distributeDonations', () => {
    let userService: UserService;
    let systemLockService: SystemLockService;
    let periodLimit: number;
    let periodLength: number;

    beforeEach(() => {
      periodLimit = 2000;
      periodLength = 30;
      // @ts-ignore
      userService = {
        sendDonation: jest.fn().mockImplementation(
          (from, to, args) => Promise.resolve({ _id: `t_${from}_${to}`, from, to, amount: args.amount }))
      };

      systemLockService = new SystemLocks(dbUtils.getDb());
    });

    const createDistributionService = () => new DonationDistributions(dbUtils.getDb(), {
      periodLimit,
      periodLength,
      users: userService,
      systemLocks: systemLockService
    });
  
    test('should distribute donations and save distribution details and release distribution lock', async () => {
      const distributionService = createDistributionService();
      const lock = systemLockService.distribution();
      // return the previous lock when distribution() is called, so that we can spy on it
      jest.spyOn(systemLockService, 'distribution').mockReturnValue(lock);
      jest.spyOn(lock, 'lock');
      jest.spyOn(lock, 'unlock');
      const started = new Date();
      const res = await distributionService.distributeDonations();
      const finished = new Date();
      const savedData: DonationDistributionResults = await dbUtils.getCollection(COLL).findOne({ _id: res._id });
      savedData.distributions.sort((a, b) => a.transaction.localeCompare(b.transaction));

      // verify that start and stop time were recorded
      expect(Math.abs(started.getTime() - savedData.startedAt.getTime()) < 1000).toBe(true);
      expect(Math.abs(finished.getTime() - savedData.finishedAt.getTime()) < 1000).toBe(true);

      expect(savedData.distributions).toEqual([
        {
          donor: 'donor1',
          beneficiary: 'beneficiary1',
          amount: 1500,
          transaction: 't_donor1_beneficiary1',
          success: true,
          error: null
        },
        {
          donor: 'donor1',
          beneficiary: 'beneficiary3',
          amount: 630,
          transaction: 't_donor1_beneficiary3',
          success: true,
          error: null
        },
        {
          donor: 'donor3',
          beneficiary: 'beneficiary4',
          amount: 1600,
          transaction: 't_donor3_beneficiary4',
          success: true,
          error: null
        }
      ]);

      expect(lock.lock).toHaveBeenCalledTimes(1);
      expect(lock.unlock).toHaveBeenCalledTimes(1);
      await lock.ensureUnlocked();
    });

    describe('Vetted distribution', () => {
      test('should distribute only to vetted beneficiaries, from any donor', async () => {
        const distributionService = createDistributionService();
        const res = await distributionService.distributeDonations(true);

        const savedData: DonationDistributionResults = await dbUtils.getCollection(COLL).findOne({ _id: res._id });
        const { distributions } = savedData;
        // beneficiary3 should receive 630
        expect(distributions.filter(d => d.beneficiary === 'beneficiary3').reduce((a, b) => a + b.amount, 0)).toEqual(630);
        // beneficiary4 should receive 2000
        expect(distributions.filter(d => d.beneficiary === 'beneficiary4').reduce((a, b) => a + b.amount, 0)).toEqual(2000);
        // beneficiary5 should receive 2000
        expect(distributions.filter(d => d.beneficiary === 'beneficiary5').reduce((a, b) => a + b.amount, 0)).toEqual(2000);

        // confirm the total is 4630 to ensure no other beneficiary was included in the distribution
        expect(distributions.reduce((a, b) => a + b.amount, 0)).toEqual(4630);
      });
    });

    test('should not run if distribution lock is locked', async () => {
      const lock = systemLockService.distribution();
      const lock2 = systemLockService.distribution();
      // return lock2 on subsequent requests for a distribution lock handle, so that we can spy on it
      jest.spyOn(systemLockService, 'distribution').mockReturnValue(lock2);
      jest.spyOn(lock2, 'lock');
      jest.spyOn(lock2, 'unlock');

      await lock.lock();

      const distributionService = createDistributionService();
      await expectAsyncAppError(() => distributionService.distributeDonations(), 'systemLockLocked');

      expect(lock2.lock).toHaveBeenCalledTimes(1);
      expect(lock2.unlock).toHaveBeenCalledTimes(1);

      await lock.unlock();
    });

    test('should release distribution lock even if error occurs', async () => {
      const db = dbUtils.getDb();
      const errorCursor = {
        toArray: () => Promise.reject(new Error('error'))
      };

      jest.spyOn(db, 'collection').mockReturnValue({
        insertOne: () => Promise.reject(new Error('error')),
        // @ts-ignore
        aggregate: () => errorCursor,
        // @ts-ignore
        find: () => errorCursor
      });

      jest.spyOn(systemLockService, 'distribution').mockReturnValue({
        lock: jest.fn().mockResolvedValue({}),
        unlock: jest.fn().mockResolvedValue({}),
        ensureUnlocked: jest.fn().mockResolvedValue({}),
        getKey: jest.fn().mockReturnValue('')
      });
      
      const distributionService = createDistributionService();
      try {
        await distributionService.distributeDonations();
      } catch {}

      expect(systemLockService.distribution().unlock).toHaveBeenCalledTimes(1);

      // @ts-ignore
      db.collection.mockRestore();
    });

    test('conflicting operations should not run while distribution is in progress', async (done) => {
      let callbacks: Function[] = [];
      // @ts-ignore
      userService = {
        sendDonation: jest.fn().mockImplementation((from, to, args) => new Promise((resolve) => {
          // save callbacks so we can control when to complete the process
          callbacks.push(() => resolve({ _id : `t_${from}_${to}`, from, to, amount: args.amount }));
        }))
      };

      const distributionService = createDistributionService();
      distributionService.distributeDonations().then(() => done()).catch(done);

      setTimeout(async () => {
        // simulate concurrent operations that require the lock to be free
        await expectAsyncAppError(() => systemLockService.distribution().ensureUnlocked(), 'systemLockLocked');
        // simulate concurrent operations that attempt to acquire lock
        await expectAsyncAppError(() => systemLockService.distribution().lock(), 'systemLockLocked');
        // cannot run two distribution processes simultaneously
        await expectAsyncAppError(() => distributionService.distributeDonations(), 'systemLockLocked');

        // call the callbacks to complete distributions
        callbacks.forEach(cb => cb());
      }, 10);

    });
  });
});

import { createDbUtils } from '../../test-util';
import { users, transactions } from './fixtures';
import { findEligibleBeneficiaries, computeDonorsBalances } from '../distributor';

const DB = '_crowd_relief_distribution_tests_';
const USERS_COLL = 'users';

describe('DonationDistributor', () => {
  const dbUtils = createDbUtils(DB, USERS_COLL);
  const usersCollection = () => dbUtils.getDb().collection(USERS_COLL);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  beforeEach(async () => {
    await Promise.all([
      dbUtils.resetCollectionWith(transactions, 'transactions'),
      dbUtils.resetCollectionWith(users, USERS_COLL)
    ]);
  });

  describe('findEligibleBeneficiaries', () => {
    test('should find beneficiaries who have received less than the limit within the last period', async () => {
      const result = await findEligibleBeneficiaries(usersCollection(), 2000, 30);
      expect(result).toEqual([
        // 500 + 1000
        { _id: 'beneficiary1', donors: ['donor1'], totalReceived: 500, remaining: 1500 },
        // 1200 + 170
        { _id: 'beneficiary3', donors: ['donor1', 'donor2'], totalReceived: 1370, remaining: 630 }
      ]);
    });
  });

  describe('computeDonorsBalances', () => {
    test('should compute the balance of each donor based on their transactions', async () => {
      const result = await computeDonorsBalances(usersCollection(), ['donor1', 'donor2', 'donor3']);
      result.sort((a, b) => a._id.localeCompare(b._id));
      expect(result).toEqual([
        // 5000 - 1000 - 500 - 170
        { _id: 'donor1', balance: 3330 },
        // 2500 - 600
        { _id: 'donor2', balance: 1900 },
        // 4000 - 1400 - 1200
        { _id: 'donor3', balance: 1400 }
      ]);
    });
  });
});

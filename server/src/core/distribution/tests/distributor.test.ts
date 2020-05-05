import { createDbUtils } from '../../test-util';
import { users, transactions } from './fixtures';
import { findEligibleBeneficiaries } from '../distributor';

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
        { _id: 'beneficiary1', donors: ['donor1'], total: 500, remaining: 1500 },
        { _id: 'beneficiary3', donors: ['donor1', 'donor2'], total: 1370, remaining: 630 }
      ]);
    });
  });
});

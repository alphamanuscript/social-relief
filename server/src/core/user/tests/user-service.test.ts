import { createDbUtils } from '../../test-util';
import { users } from './fixtures';
import { Users, UsersArgs } from '../user-service';
import { User } from '../types';

const DB = '_social_relief_user_service_tests_';
const COLLECTION = 'users';


describe('UserService tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  beforeEach(async () => {
    await dbUtils.resetCollectionWith(users);
  });

  function usersColl() {
    return dbUtils.getCollection<User>(COLLECTION);
  }

  describe('nominateBeneficiary', () => {
    describe('when nominator is a middleman', () => {
      test('should add represented donors to existing beneficiary', async () => {
        const args: any = { transactions: {} };
        const service = new Users(dbUtils.getDb(), args);
        const res = await service.nominateBeneficiary({ phone: '254700444444', nominator: 'middleman1' });
        expect(res._id).toBe('beneficiary1');
        const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
        updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
        const expectedDonors = ['donor1', 'donor2']
        expect(updatedBeneficiary.donors).toEqual(expectedDonors);
      });
    })
  });
});

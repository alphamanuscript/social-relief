import { createDbUtils, expectDatesAreClose } from '../../test-util';
import { users } from './fixtures';
import { Users } from '../user-service';
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
    function createService() {
      const args: any = { transactions: {} };
      const service = new Users(dbUtils.getDb(), args);
      return service;
    }

    describe('when nominator is a middleman', () => {
      test('should add represented donors to existing beneficiary', async () => {
        const res = await createService().nominateBeneficiary({ phone: '254700444444', nominator: 'middleman1' });
        expect(res._id).toBe('beneficiary1');
        const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
        updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
        const expectedDonors = ['donor1', 'donor2']
        expect(updatedBeneficiary.donors).toEqual(expectedDonors);
      });

      test('should also add middleman to beneficiary donors if middleman is also a donor', async () => {
        const now = new Date();
        const res = await createService().nominateBeneficiary({ phone: '254700444444', nominator: 'donorMiddleman1' });
        expect(res._id).toBe('beneficiary1');
        const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
        updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
        const expectedDonors = ['donor1', 'donor2', 'donorMiddleman1']
        expect(updatedBeneficiary.donors).toEqual(expectedDonors);
        expectDatesAreClose(now, updatedBeneficiary.updatedAt);
      });

      test('should create beneficiary if does not already exist', async () => {
        const now = new Date();
        const res = await createService().nominateBeneficiary({ phone: '254711222333', nominator: 'donorMiddleman1' });
        const createdBeneficiary = await usersColl().findOne({ _id: res._id });
        createdBeneficiary.donors.sort((a, b) => a.localeCompare(b));
        expect(createdBeneficiary.phone).toBe('254711222333');
        expect(createdBeneficiary.donors).toEqual(['donor1', 'donorMiddleman1']);
        expect(createdBeneficiary.roles).toEqual(['beneficiary']);
        expect(createdBeneficiary.addedBy).toBe('donorMiddleman1');
        expectDatesAreClose(now, createdBeneficiary.createdAt);
        expectDatesAreClose(now, createdBeneficiary.updatedAt);
      });
    });
  });
});

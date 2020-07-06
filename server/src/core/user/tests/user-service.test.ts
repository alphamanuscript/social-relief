import { createDbUtils, expectDatesAreClose } from '../../test-util';
import { users } from './fixtures';
import { Users } from '../user-service';
import { DbUser } from '../types';

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
    return dbUtils.getCollection<DbUser>(COLLECTION);
  }

  function createDefaultService() {
    const args: any = { transactions: {} };
    const service = new Users(dbUtils.getDb(), args);
    return service;
  }

  describe('nominateBeneficiary', () => {
    describe('when nominator is a middleman', () => {
      test('should add represented donors to existing beneficiary', async () => {
        const res = await createDefaultService().nominateBeneficiary({ phone: '254700444444', nominator: 'middleman1' });
        expect(res).toEqual({ _id: 'beneficiary1', phone: '254700444444' });
        const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
        updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
        const expectedDonors = ['donor1', 'donor2']
        expect(updatedBeneficiary.donors).toEqual(expectedDonors);
      });

      test('should also add middleman to beneficiary donors if middleman is also a donor', async () => {
        const now = new Date();
        const res = await createDefaultService().nominateBeneficiary({ phone: '254700444444', nominator: 'donorMiddleman1' });
        expect(res._id).toBe('beneficiary1');
        const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
        updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
        const expectedDonors = ['donor1', 'donor2', 'donorMiddleman1']
        expect(updatedBeneficiary.donors).toEqual(expectedDonors);
        expectDatesAreClose(now, updatedBeneficiary.updatedAt);
      });

      test('should create beneficiary if does not already exist', async () => {
        const now = new Date();
        const res = await createDefaultService().nominateBeneficiary({ phone: '254711222333', nominator: 'donorMiddleman1' });
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

  describe('nominateMiddleman', () => {
    test('should add donor to the list of donors the middleman represents and add middleman role', async () => {
      const now = new Date();
      const res = await createDefaultService().nominateMiddleman({ phone: '254700222222', nominator: 'donor1' });
      expect(res).toEqual({ _id: 'donor2', phone: '254700222222' });
      const updatedMiddleman = await usersColl().findOne({ _id: res._id });
      updatedMiddleman.roles.sort((a, b) => a.localeCompare(b));
      expect(updatedMiddleman.roles).toEqual(['donor', 'middleman']);
      expect(updatedMiddleman.middlemanFor).toEqual(['donor1']);
      expectDatesAreClose(now, updatedMiddleman.updatedAt);
    });

    test('should create new user if does not exist', async () => {
      const now = new Date();
      const res = await createDefaultService().nominateMiddleman({ phone: '254766111222', nominator: 'donor1' });
      const createdMiddleman = await usersColl().findOne({ _id: res._id });
      expect(createdMiddleman.roles).toEqual(['middleman']);
      expect(createdMiddleman.middlemanFor).toEqual(['donor1']);
      expectDatesAreClose(now, createdMiddleman.createdAt);
      expectDatesAreClose(now, createdMiddleman.updatedAt);
      expect(createdMiddleman.phone).toBe('254766111222');
      expect(createdMiddleman.password).toBe('');
    });

    test('should allow nominating user who is already a middleman for other donors', async () => {
      const now = new Date();
      const res = await createDefaultService().nominateMiddleman({ phone: '254700555555', nominator: 'donor2' });
      expect(res._id).toBe('donorMiddleman1');
      const updatedMiddleman = await usersColl().findOne({ _id: res._id });
      expect(updatedMiddleman.roles).toEqual(['donor', 'middleman']);
      expect(updatedMiddleman.middlemanFor).toEqual(['donor1', 'donor2']);
      expectDatesAreClose(now, updatedMiddleman.updatedAt);
    });

    test('allows nominating beneficiary as middleman', async () => {
      const now = new Date();
      const res = await createDefaultService().nominateMiddleman({ phone: '254700444444',  nominator: 'donor1' });
      expect(res._id).toBe('beneficiary1');
      const updatedMiddleman = await usersColl().findOne({ _id: res._id });
      expect(updatedMiddleman.roles).toEqual(['beneficiary', 'middleman']);
      expect(updatedMiddleman.middlemanFor).toEqual(['donor1']);
      expectDatesAreClose(now, updatedMiddleman.updatedAt);
    });
  });

  describe('getAllMiddlemenByUser', () => {
    test('should return all the middleman for the specified user', async () => {
      const res = await createDefaultService().getAllMiddlemenByUser('donor1');
      res.sort((a, b) => a._id.localeCompare(b._id));
      expect(res).toEqual([{ _id: 'donorMiddleman1', phone: '254700555555' }, { _id: 'middleman1', phone: '254700333333' }]);
    });
  });
});

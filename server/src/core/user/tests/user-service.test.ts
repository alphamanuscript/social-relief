import { createDbUtils, expectDatesAreClose } from '../../test-util';
import { users } from './fixtures';
import { Users } from '../user-service';
import { DbUser, UserNominateArgs } from '../types';
import { InvitationCreateArgs } from '../../invitation';
import { generateId } from '../../util';

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
    const now = new Date();
    const args: any = { 
      transactions: {}, 
      invitations: { 
        create: jest.fn().mockImplementation((args: InvitationCreateArgs) => Promise.resolve({
          _id: generateId(),
          invitorId: args.invitorId, 
          invitorName: args.invitorName, 
          inviteeName: args.inviteeName,
          inviteePhone: args.inviteePhone,
          inviteeEmail: args.inviteeEmail,
          inviteeRole: args.inviteeRole,
          hasAccount: true,
          status: 'pending',
          expiresAt: now,
          createdAt: now,
          updatedAt: now,
        })) 
      }
    };
    const service = new Users(dbUtils.getDb(), args);
    return service;
  }

  describe('nominate', () => {
    test('should return an invitation to the nominated user', async () => {
      const nominateArgs: UserNominateArgs = {
        nominatorId: 'middleman1', 
        nominatorName: 'John Doe', 
        name: 'John',
        phone: '254700444444',
        email: 'john@gmail.com',
        role: 'beneficiary'
      }
      const res = await createDefaultService().nominate(nominateArgs);
      expect(res.invitorId).toBe(nominateArgs.nominatorId);
      expect(res.invitorName).toBe(nominateArgs.nominatorName);
      expect(res.inviteeName).toBe(nominateArgs.name);
      expect(res.inviteePhone).toBe(nominateArgs.phone);
      expect(res.inviteeEmail).toBe(nominateArgs.email);
      expect(res.inviteeRole).toBe(nominateArgs.role);
      expect(res.status).toBe('pending');
      expect(res.status).not.toHaveProperty('code');
    })
  });

  // describe('nominateBeneficiary', () => {
  //   describe('when nominator is a middleman', () => {
  //     test('should add represented donors to existing beneficiary', async () => {
  //       const res = await createDefaultService().nominateBeneficiary(
  //         { phone: '254700444444', nominator: 'middleman1', name: 'John' });
  //       expect(res).toEqual({ _id: 'beneficiary1', phone: '254700444444' });
  //       const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
  //       updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
  //       const expectedDonors = ['donor1', 'donor2']
  //       expect(updatedBeneficiary.donors).toEqual(expectedDonors);
  //     });

  //     test('should also add middleman to beneficiary donors if middleman is also a donor', async () => {
  //       const now = new Date();
  //       const res = await createDefaultService().nominateBeneficiary(
  //         { phone: '254700444444', nominator: 'donorMiddleman1', name: 'John' });
  //       expect(res._id).toBe('beneficiary1');
  //       const updatedBeneficiary = await usersColl().findOne({ _id: res._id });
  //       updatedBeneficiary.donors.sort((a, b) => a.localeCompare(b));
  //       const expectedDonors = ['donor1', 'donor2', 'donorMiddleman1']
  //       expect(updatedBeneficiary.donors).toEqual(expectedDonors);
  //       expectDatesAreClose(now, updatedBeneficiary.updatedAt);
  //     });

  //     test('should create beneficiary if does not already exist', async () => {
  //       const now = new Date();
  //       const res = await createDefaultService().nominateBeneficiary(
  //         { phone: '254711222333', nominator: 'donorMiddleman1', name: 'John' });
  //       const createdBeneficiary = await usersColl().findOne({ _id: res._id });
  //       createdBeneficiary.donors.sort((a, b) => a.localeCompare(b));
  //       expect(createdBeneficiary.phone).toBe('254711222333');
  //       expect(createdBeneficiary.donors).toEqual(['donor1', 'donorMiddleman1']);
  //       expect(createdBeneficiary.roles).toEqual(['beneficiary']);
  //       expect(createdBeneficiary.addedBy).toBe('donorMiddleman1');
  //       expectDatesAreClose(now, createdBeneficiary.createdAt);
  //       expectDatesAreClose(now, createdBeneficiary.updatedAt);
  //     });
  //   });
  // });

  // describe('nominateMiddleman', () => {
  //   test('should add donor to the list of donors the middleman represents and add middleman role', async () => {
  //     const now = new Date();
  //     const res = await createDefaultService().nominateMiddleman(
  //       { phone: '254700222222', nominator: 'donor1', name: 'James' });
  //     expect(res).toEqual({ _id: 'donor2', phone: '254700222222' });
  //     const updatedMiddleman = await usersColl().findOne({ _id: res._id });
  //     updatedMiddleman.roles.sort((a, b) => a.localeCompare(b));
  //     expect(updatedMiddleman.roles).toEqual(['donor', 'middleman']);
  //     expect(updatedMiddleman.middlemanFor).toEqual(['donor1']);
  //     expectDatesAreClose(now, updatedMiddleman.updatedAt);
  //   });

  //   test('should create new user if does not exist', async () => {
  //     const now = new Date();
  //     const res = await createDefaultService().nominateMiddleman(
  //       { phone: '254766111222', nominator: 'donor1', name: 'James' });
  //     const createdMiddleman = await usersColl().findOne({ _id: res._id });
  //     expect(createdMiddleman.roles).toEqual(['middleman']);
  //     expect(createdMiddleman.middlemanFor).toEqual(['donor1']);
  //     expectDatesAreClose(now, createdMiddleman.createdAt);
  //     expectDatesAreClose(now, createdMiddleman.updatedAt);
  //     expect(createdMiddleman.phone).toBe('254766111222');
  //     expect(createdMiddleman.password).toBe('');
  //   });

  //   test('should allow nominating user who is already a middleman for other donors', async () => {
  //     const now = new Date();
  //     const res = await createDefaultService().nominateMiddleman(
  //       { phone: '254700555555', nominator: 'donor2', name: 'James' });
  //     expect(res._id).toBe('donorMiddleman1');
  //     const updatedMiddleman = await usersColl().findOne({ _id: res._id });
  //     expect(updatedMiddleman.roles).toEqual(['donor', 'middleman']);
  //     expect(updatedMiddleman.middlemanFor).toEqual(['donor1', 'donor2']);
  //     expectDatesAreClose(now, updatedMiddleman.updatedAt);
  //   });

  //   test('allows nominating beneficiary as middleman', async () => {
  //     const now = new Date();
  //     const res = await createDefaultService().nominateMiddleman(
  //       { phone: '254700444444',  nominator: 'donor1', name: 'James' });
  //     expect(res._id).toBe('beneficiary1');
  //     const updatedMiddleman = await usersColl().findOne({ _id: res._id });
  //     expect(updatedMiddleman.roles).toEqual(['beneficiary', 'middleman']);
  //     expect(updatedMiddleman.middlemanFor).toEqual(['donor1']);
  //     expectDatesAreClose(now, updatedMiddleman.updatedAt);
  //   });
  // });

  describe('getAllMiddlemenByUser', () => {
    test('should return all the middleman for the specified user', async () => {
      const res = await createDefaultService().getAllMiddlemenByUser('donor1');
      res.sort((a, b) => a._id.localeCompare(b._id));
      expect(res).toEqual([{ _id: 'donorMiddleman1', phone: '254700555555' }, { _id: 'middleman1', phone: '254700333333' }]);
    });
  });
});

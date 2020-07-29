import { createDbUtils, expectDatesAreClose } from '../../test-util';
import { users } from './fixtures';
import { Users } from '../user-service';
import { DbUser, UserNominateArgs, UserInvitationEventData } from '../types';
import { InvitationCreateArgs } from '../../invitation';
import { generateId } from '../../util';
import { EventBus } from '../../event';

const DB = '_social_relief_user_service_tests_';
const COLLECTION = 'users';
const invitationIds = [generateId()];


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
        })),
        get: jest.fn().mockImplementation((invitationId: string) => {
          if (invitationId === invitationIds[0]) {
            return Promise.resolve({
              _id: invitationIds[0],
              invitorId: 'middleman1', 
              invitorName: 'John Doe', 
              inviteeName: 'John',
              inviteePhone: '254700444444',
              inviteeEmail: 'john@gmail.com',
              inviteeRole: 'beneficiary',
              hasAccount: false,
              status: 'pending',
              expiresAt: now,
              createdAt: now,
              updatedAt: now,
            })
          }
        })
      },
      eventBus: {
        emitUserInvitationCreated: jest.fn().mockImplementation((eventData: UserInvitationEventData) => {})
      }
    };
    const service = new Users(dbUtils.getDb(), args);
    return service;
  }

  describe('getAllMiddlemenByUser', () => {
    test('should return all the middleman for the specified user', async () => {
      const res = await createDefaultService().getAllMiddlemenByUser('donor1');
      res.sort((a, b) => a._id.localeCompare(b._id));
      expect(res).toEqual([{ _id: 'donorMiddleman1', phone: '254700555555' }, { _id: 'middleman1', phone: '254700333333' }]);
    });
  });
});

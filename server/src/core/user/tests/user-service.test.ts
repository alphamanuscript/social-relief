import { createDbUtils, expectDatesAreClose } from '../../test-util';
import { users } from './fixtures';
import { Users } from '../user-service';
import { UserNominateArgs, UserInvitationEventData, UserService } from '../types';
import { InvitationCreateArgs, InvitationService } from '../../invitation';
import { generateId } from '../../util';
import { SystemLockService } from '../../system-lock';
import { TransactionService, Transactions, PaymentProviderRegistry, PaymentProviders, PaymentProvider } from '../../payment';
import { EventBus } from '../../event';
import { SystemLocks } from '../../system-lock';

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
      expect(res).toHaveProperty('hasAccount');
      expect(res.status).toBe('pending');
      expect(res).toHaveProperty('expiresAt');
      expect(res).toHaveProperty('createdAt');
      expect(res).toHaveProperty('updatedAt');
    })
  });

  describe('getAllMiddlemenByUser', () => {
    test('should return all the middleman for the specified user', async () => {
      const res = await createDefaultService().getAllMiddlemenByUser('donor1');
      res.sort((a, b) => a._id.localeCompare(b._id));
      expect(res).toEqual([{ _id: 'donorMiddleman1', phone: '254700555555' }, { _id: 'middleman1', phone: '254700333333' }]);
    });
  });

  describe('refunds', () => {
    let systemLocks: SystemLockService;
    let transactions: TransactionService;
    let eventBus: EventBus;
    let invitations: InvitationService;
    let paymentProviders: PaymentProviderRegistry;
    let userService: UserService;

    beforeEach(() => {
      paymentProviders = new PaymentProviders();

      invitations = null; // not required for these tests
      eventBus = new EventBus();
      systemLocks = new SystemLocks(dbUtils.getDb());
      transactions = new Transactions(dbUtils.getDb(), { eventBus, paymentProviders });
      userService = new Users(dbUtils.getDb(), { systemLocks, transactions, eventBus, invitations })
    });

    describe('initiateRefund', () => {
      test('should create refund transaction to user and block further transactions');
      test('should fail if balance is <= 0');
      test('should fail if distribution lock is in use');
    });

    describe('when refund transaction is completed', () => {
      test('should increment refund counter for user');
      test('should clear transactions block if transactions were blocked by refund');
      test('should permanently block transactions if max refunds reached');
    });
  });

  describe('when transactions blocked', () => {
    test('initiateDonation should fail');
    test('sendDonation should fail');
    test('initiateRefund should fail');
  });
});

import { createDbUtils, expectAsyncAppError } from '../../test-util';
import { users } from './fixtures';
import { Users, MAX_ALLOWED_REFUNDS } from '../user-service';
import { UserNominateArgs, UserInvitationEventData, UserService, DbUser, UserTransactionsBlockedReason } from '../types';
import { InvitationCreateArgs, InvitationService } from '../../invitation';
import { generateId } from '../../util';
import { SystemLockService } from '../../system-lock';
import { TransactionService, Transactions, PaymentProviderRegistry, PaymentProviders, PaymentProvider, Transaction } from '../../payment';
import { EventBus } from '../../event';
import { SystemLocks } from '../../system-lock';
import { verify } from 'argon2';

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
        emitUserInvitationCreated: jest.fn(),
        onTransactionCompleted: jest.fn()
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
    let transactions: any;
    let eventBus: EventBus;
    let invitations: InvitationService;
    let userService: UserService;

    function createServiceForRefunds() {

    }

    beforeEach(() => {

      invitations = null; // not required for these tests
      eventBus = new EventBus();
      systemLocks = new SystemLocks(dbUtils.getDb());
      transactions = {
        initiateRefund: jest.fn()
      };
      userService = new Users(dbUtils.getDb(), { systemLocks, transactions, eventBus, invitations })
    });

    describe('initiateRefund', () => {
      test('should create refund transaction to user and block further transactions', async () => {
        const userId = 'donor1';
        const expectedTx = {
          from: 'userId',
          to: '',
          toExternal: true,
          type: 'refund',
          expectedAmount: 1000,
          status: 'pending'
        };

        transactions.initiateRefund = jest.fn().mockResolvedValue(expectedTx);

        const res = await userService.initiateRefund(userId);
        expect(res).toEqual(expectedTx);

        const user = await dbUtils.getCollection().findOne({ _id: 'donor1' });
        expect(user.transactionsBlockedReason).toBe('refundPending');
      });

      test('should fail if distribution lock is in use', async () => {
        const userId = 'donor1';
        const lock = systemLocks.distribution();
        await lock.lock();
        await expectAsyncAppError(async () => await userService.initiateRefund(userId), 'systemLockLocked');
        await lock.unlock();

        // user should not be transactions-blocked
        const user = await dbUtils.getCollection().findOne({ _id: 'donor1' });
        expect(user.transactionsBlockedReason).toBeUndefined();
      });
    });

    describe('when refund transaction is completed', () => {
      let userService: Users;
      let eventBus: EventBus;
      let transaction: Transaction;

      beforeEach(() => {
        const db = dbUtils.getDb();
        eventBus = new EventBus();

        userService = new Users(db, {
          systemLocks: new SystemLocks(db),
          eventBus,
          transactions: null,
          invitations: null
        });

        transaction = {
          _id: 'tx',
          type: 'refund',
          to: '',
          toExternal: true,
          from: 'donor1',
          fromExternal: true,
          amount: 1000,
          expectedAmount: 1000,
          status: 'success',
          provider: 'testPaymentProvider',
          providerTransactionId: 'providerTx',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      /**
       * capture the promise of the event handler so that we can
       * detect when the function has completed execution
       */
      function captureEventHandlerPromise() {
        type CapturedPromises = {
          eventHandlerPromise: Promise<void>
        };

        const capture: CapturedPromises = {
          eventHandlerPromise: null
        };

        const originalHandler = userService.handleRefundCompleted;
        jest.spyOn(userService, 'handleRefundCompleted').mockImplementation((event) => {
          capture.eventHandlerPromise = originalHandler.bind(userService)(event);
          return capture.eventHandlerPromise;
        });

        return capture;
      }

      test('should increment refund counter for user', async () => {
        const capturedPromises = captureEventHandlerPromise();

        eventBus.emitTransactionCompleted({ transaction });


        expect(userService.handleRefundCompleted).toHaveBeenCalled();
        await capturedPromises.eventHandlerPromise;

        let user = await dbUtils.getCollection<DbUser>().findOne({ _id: 'donor1' });
        expect(user.numRefunds).toBe(1);

        transaction._id = 'tx2';
        eventBus.emitTransactionCompleted({ transaction });
        await capturedPromises.eventHandlerPromise;

        user = await dbUtils.getCollection<DbUser>().findOne({ _id: 'donor1' });
        expect(user.numRefunds).toBe(2);
      });

      test('should clear transactions block if transactions were blocked by refund', async () => {
        const capturedPromises = captureEventHandlerPromise();

        const res = await dbUtils.getCollection<DbUser>().findOneAndUpdate({
          _id: 'donor1'
        }, { 
          $set: {transactionsBlockedReason: 'refundPending' }
        }, { 
          returnOriginal: false 
        });

        expect(res.value.transactionsBlockedReason).toBe('refundPending');

        eventBus.emitTransactionCompleted({ transaction });
        await capturedPromises.eventHandlerPromise;

        const updatedUser = await dbUtils.getCollection<DbUser>().findOne({ _id: 'donor1' });
        expect(updatedUser.transactionsBlockedReason).toBeUndefined();
      });

      test('should permanently block transactions if max refunds reached', async () => {
        const capturedPromises = captureEventHandlerPromise();

        // update user to have only one refund remaining before block
        await dbUtils.getCollection<DbUser>().updateOne({ _id: 'donor1' }, { $set: { numRefunds: MAX_ALLOWED_REFUNDS - 1 } });

        eventBus.emitTransactionCompleted({ transaction });

        await capturedPromises.eventHandlerPromise;

        const updatedUser = await dbUtils.getCollection<DbUser>().findOne({ _id: 'donor1' });
        expect(updatedUser.transactionsBlockedReason).toBe<UserTransactionsBlockedReason>('maxRefundsExceeded');

      });
    });
  });

  describe('when transactions blocked', () => {
    let userService: UserService;

    beforeEach(async () => {
      const db = dbUtils.getDb();
      userService = new Users(db, {
        systemLocks: new SystemLocks(db),
        eventBus: new EventBus(),
        transactions: null,
        invitations: null
      });

      await dbUtils.getCollection().updateOne({ _id: 'donor1' }, { $set: { transactionsBlockedReason: 'refundPending' } });
    });

    async function verifyTransactionsBlockNotCleared() {
      const user = await dbUtils.getCollection().findOne({ _id: 'donor1' });
      expect(user.transactionsBlockedReason).toBe('refundPending');
    }

    test('initiateDonation should fail', async () => {
      await expectAsyncAppError(() => userService.initiateDonation('donor1', { amount: 1000 }), 'transactionRejected');
      await verifyTransactionsBlockNotCleared();
    });

    test('sendDonation should fail', async () => {
      await expectAsyncAppError(() => userService.sendDonation('donor1', 'beneficiary1', { amount: 1000 }), 'transactionRejected');
      await verifyTransactionsBlockNotCleared();
    });

    test('initiateRefund should fail', async () => {
      await expectAsyncAppError(() => userService.initiateRefund('donor1'), 'transactionRejected');
      await verifyTransactionsBlockNotCleared();
    });
  });
});

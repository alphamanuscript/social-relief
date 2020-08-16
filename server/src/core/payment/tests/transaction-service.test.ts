import { createDbUtils, expectAsyncAppError } from '../../test-util';
import { transactions } from './fixtures';
import { Transactions } from '../transaction-service';
import { EventBus } from '../../event';
import { PaymentProviders } from '../provider-registry';
import { PaymentProviderRegistry, PaymentProvider, SendFundsResult } from '../types';

const DB = '_social_relief_transaction_service_tests_';
const COLLECTION = 'transactions';

describe('TransactionService tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);
  let paymentProviders: PaymentProviderRegistry;
  let testPaymentProvider: PaymentProvider;

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  beforeEach(async () => {
    await dbUtils.resetCollectionWith(transactions);
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  beforeEach(() => {
    paymentProviders = new PaymentProviders();
    testPaymentProvider = {
      name: () => 'testPaymentProvider',
      requestPaymentFromUser: jest.fn(),
      handlePaymentNotification: jest.fn(),
      getTransaction: jest.fn(),
      sendFundsToUser: jest.fn()
    };
    
    paymentProviders.register(testPaymentProvider);
    paymentProviders.setPreferredForSending(testPaymentProvider.name());
    paymentProviders.setPreferredForReceiving(testPaymentProvider.name());
  });

  function createService() {
    const service = new Transactions(dbUtils.getDb(), {
      eventBus: new EventBus(),
      paymentProviders
    });

    return service;
  }

  describe('getUserBalance', () => {
    test('returns 0 if user has no transactions', async () => {
      const user = 'userWithNoTransactions';
      const service = createService();
      const res = await service.getUserBalance(user);
      expect(res).toBe(0);
    });

    test('returns total successful inbound transactions minus non-failed outbound transactions', async () => {
      const user = 'u1';
      const service = createService();
      const res = await service.getUserBalance(user);
      expect(res).toBe(1800);
    });
  });

  describe('initiateRefund', () => {
    test('creates transaction and sends balance to user', async () => {
      const providerTransactionId = 'providerTx1'
      testPaymentProvider.sendFundsToUser = jest.fn().mockResolvedValue({ providerTransactionId, status: 'pending' });
      
      const service = createService();
      const res = await service.initiateRefund({
        _id: 'u1',
        phone: '2547123444555',
        name: 'John',
        email: 'john@mailer.com',
        roles: ['donor'],
        createdAt: new Date(),
        updatedAt: new Date(),
        addedBy: '',
        donors: []
      });

      expect(res.expectedAmount).toBe(1800);
      expect(res.amount).toBe(0);
      expect(res.fromExternal).toBe(false);
      expect(res.from).toBe('u1');
      expect(res.toExternal).toBe(true);
      expect(res.to).toBe('');
      expect(res.providerTransactionId).toBe(providerTransactionId);
      expect(res.provider).toBe('testPaymentProvider');
      expect(res.status).toBe('pending');
      expect(res.type).toBe('refund');

      const savedTx = await dbUtils.getCollection().findOne({ _id: res._id });
      expect(savedTx).toEqual(res);
    });

    test('throws error if user balance is <= 0', async () => {
      await expectAsyncAppError(async () => {
        var service = createService();
        const user: any = { _id: 'userWithNoTransactions' };

        await service.initiateRefund(user);
      }, 'insufficientFunds');
    });
  });
});

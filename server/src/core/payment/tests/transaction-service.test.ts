import { createDbUtils } from '../../test-util';
import { transactions } from './fixtures';
import { Transactions } from '../transaction-service';
import { EventBus } from '../../event';
import { PaymentProviders } from '../provider-registry';

const DB = '_social_relief_transaction_service_tests_';
const COLLECTION = 'transactions';

describe('TransactionService tests', () => {
  const dbUtils = createDbUtils(DB, COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  beforeEach(async () => {
    await dbUtils.resetCollectionWith(transactions);
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  function createService() {
    const service = new Transactions(dbUtils.getDb(), {
      eventBus: new EventBus(),
      paymentProviders: new PaymentProviders()
    });

    return service;
  }

  describe('getUserBalance', () => {
    test('returns 0 if user has no transactions', async () => {
      const user = 'userWithNoTransactions';
      var service = createService();
      const res = await service.getUserBalance(user);
      expect(res).toBe(0);
    });

    test('returns total successful inbound transactions minus non-failed outbound transactions', async () => {
      const user = 'u1';
      var service = createService();
      const res = await service.getUserBalance(user);
      expect(res).toBe(1800);
    });
  });
});

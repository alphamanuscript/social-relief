import { transactions } from './fixtures';
import { Statistics } from '../stat-service';
import { Stats } from '../types';

import { createDbUtils, expectDatesAreClose } from '../../test-util';

const DB = '_social_relief_stat_service_tests_';
const STATS_COLLECTION = 'stats';
const TRANSACTION_COLLECTION = 'transactions';

describe('stat-service tests', () => {
  const dbUtils = createDbUtils(DB, STATS_COLLECTION);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  beforeEach(async () => {
    await dbUtils.resetCollectionWith([], STATS_COLLECTION);
    await dbUtils.resetCollectionWith(transactions, TRANSACTION_COLLECTION);
  });

  function statsColl() {
    return dbUtils.getCollection<Stats>(STATS_COLLECTION);
  }

  function transactionsColl() {
    return dbUtils.getCollection<any>(TRANSACTION_COLLECTION)
  }

  async function aggregateTransactions(pipeline: any[]) {
    const results = await this.collection.aggregate(pipeline, { allowDiskUse: true }).toArray();
    return results;
  }

  function createDefaultService() {
    const now = new Date();
    const args: any = { 
      transactions: {
        aggregate: jest.fn().mockImplementation(async (pipeline: any[]) => Promise.resolve(await aggregateTransactions(pipeline)))
      },
    };
    const service = new Statistics(dbUtils.getDb(), args);
    return service;
  }

  describe('update', () => {
    it('should create and return a stats doc', async () => {
      let statsDoc = await statsColl().findOne({ _id: 'stats' });
      expect(statsDoc).toBeFalsy();
      statsDoc = await createDefaultService().update();
      expect(statsDoc).toBeTruthy();
    })
  })
});
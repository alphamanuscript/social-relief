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

  function createDefaultService() {
    const now = new Date();
    const args: any = { 
      transactions: {
        aggregate: jest.fn().mockImplementation((pipeline: any[]) => new Promise(async (resolve) => {
          const results = await transactionsColl().aggregate(pipeline, { allowDiskUse: true }).toArray();
          resolve(results);
        }))
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
    });
    it('should return correct statistics', async () => {
      const statsDoc = await createDefaultService().update();
      expect(statsDoc.numContributors).toEqual(2);
      expect(statsDoc.numBeneficiaries).toEqual(4);
      expect(statsDoc.totalContributed).toEqual(1470);
      expect(statsDoc.totalDistributed).toEqual(880);
    });
  })
});
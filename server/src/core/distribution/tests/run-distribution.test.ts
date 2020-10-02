import { createDbUtils } from '../../test-util';
import { users, transactions } from './fixtures';
import { findEligibleBeneficiaries, computeDonorsBalances, createDistributionPlan, executeDistributionPlan } from '../run-distribution';
import { UserService } from '../../user';
import { createAppError } from '../../error';

const DB = '_crowd_relief_distribution_tests_';
const USERS_COLL = 'users';
const TRANSACTIONS_COLL = 'transactions';

describe('Donation distribution steps', () => {
  const dbUtils = createDbUtils(DB, USERS_COLL);

  beforeAll(async () => {
    await dbUtils.setupDb();
  });

  afterAll(async () => {
    await dbUtils.tearDown();
  });

  beforeEach(async () => {
    await Promise.all([
      dbUtils.resetCollectionWith(transactions, TRANSACTIONS_COLL),
      dbUtils.resetCollectionWith(users, USERS_COLL)
    ]);
  });

  describe('findEligibleBeneficiaries', () => {
    test('should find beneficiaries who have received less than the limit within the last period', async () => {
      const result = await findEligibleBeneficiaries(dbUtils.getDb(), 2000, 30);
      expect(result).toEqual([
        // 500 + 1000
        { _id: 'beneficiary1', donors: ['donor1', 'donor5'], totalReceived: 500, remaining: 1500 },
        // 1200 + 170
        { _id: 'beneficiary3', donors: ['donor1', 'donor2'], totalReceived: 1370, remaining: 630 },
        // has no transactions, therefore totalReceived == 0
        { _id: 'beneficiary4', donors: ['donor3'], totalReceived: 0, remaining: 2000 },
        // has no transactions
        { _id: 'beneficiary5', donors: [], totalReceived: 0, remaining: 2000 }
      ]);
    });
  });

  describe('computeDonorsBalances', () => {
    test('should compute the balance of each donor based on their transactions', async () => {
      const result = await computeDonorsBalances(dbUtils.getDb(), ['donor1', 'donor2', 'donor3', 'donor5']);
      result.sort((a, b) => a._id.localeCompare(b._id));
      expect(result).toEqual([
        // 5000 - 1000 - 500 - 170
        { _id: 'donor1', balance: 3330 },
        // 2500 - 600
        { _id: 'donor2', balance: 1900 },
        // 4000 + 200 - 1400 - 1200
        { _id: 'donor3', balance: 1600 },
        // donor5 has no transactions => balance is 0
        { _id: 'donor5', balance: 0 }
      ]);
    });
  });

  describe('createDistributionPlan', () => {
    test('should create plan to transfer to funds from donors to their beneficiaries without exceeding donor balance or beneficiary limit', () => {
      const beneficiaries = [
        { _id: 'b1', donors: ['d1'], totalReceived: 1500, remaining: 500 },
        { _id: 'b2', donors: ['d1', 'd2'], totalReceived: 1370, remaining: 630 },
        { _id: 'b3', donors: ['d1', 'd3'], totalReceived: 0, remaining: 2000 },
        { _id: 'b4', donors: ['d1'], totalReceived: 0, remaining: 2000 }
      ];
      const donors = [
        { _id: 'd1', balance: 1000 },
        { _id: 'd2', balance: 1900 },
        { _id: 'd3', balance: 1600 },
        { _id: 'd4', balance: 1000 }
      ];

      const result = createDistributionPlan(beneficiaries, donors);
      expect(result).toEqual({
        transfers: [
          // transfers are done in a greedy fashion
          // a donor will transfer as much as possible to one beneficiary, before moving to the next
          { donor: 'd1', beneficiary: 'b1', amount: 500 },
          { donor: 'd1', beneficiary: 'b2', amount: 500 },
          { donor: 'd2', beneficiary: 'b2', amount: 130 },
          { donor: 'd3', beneficiary: 'b3', amount: 1600 }
        ],
        // the summaries are returned for sanity checking
        // to help to debug and verify the implementation's is correctness
        donorsSummaries: {
          'd1': { toSpend: 1000, remainingBalance: 0 },
          'd2': { toSpend: 130, remainingBalance: 1770 },
          'd3': { toSpend: 1600, remainingBalance: 0 },
          'd4': { toSpend: 0, remainingBalance: 1000 }
        },
        beneficiariesSummaries: {
          'b1': { toReceive: 500, remainingEligible: 0 },
          'b2': { toReceive: 630, remainingEligible: 0 },
          'b3': { toReceive: 1600, remainingEligible: 400 },
          'b4': { toReceive: 0, remainingEligible: 2000 }
        }
      });
    });
  });

  describe('executeDistributionPlan', () => {
    test('should execute all transfers in the plan and return result summary for each transfer', async () => {
      // @ts-ignore
      const userService = {
        sendDonation: jest.fn().mockImplementation((from, to, args) => Promise.resolve({ _id: `t_${from}_${to}`, from, to, amount: args.amount }))
      } as UserService;

      const plan = [
        { donor: 'd1', beneficiary: 'b2', amount: 500 },
        { donor: 'd2', beneficiary: 'b3', amount: 1000 },
        { donor: 'd1', beneficiary: 'b4', amount: 1000 },
        { donor: 'd3', beneficiary: 'b1', amount: 500 },
        { donor: 'd2', beneficiary: 'b7', amount: 100 },
        { donor: 'd1', beneficiary: 'b4', amount: 1000 },
        { donor: 'd3', beneficiary: 'b9', amount: 500 },
        { donor: 'd2', beneficiary: 'b10', amount: 100 },
        { donor: 'd1', beneficiary: 'b11', amount: 1000 },
        { donor: 'd3', beneficiary: 'b6', amount: 500 },
        { donor: 'd2', beneficiary: 'b3', amount: 100 },
        { donor: 'd1', beneficiary: 'b9', amount: 1000 },
        { donor: 'd3', beneficiary: 'b1', amount: 500 },
        { donor: 'd2', beneficiary: 'b7', amount: 100 },
      ];

      const results = await executeDistributionPlan(userService, plan);
      expect(results.length).toEqual(plan.length);

      plan.forEach(transfer =>
        expect(userService.sendDonation).toHaveBeenCalledWith(transfer.donor, transfer.beneficiary, { amount: transfer.amount }));

      plan.forEach(transfer => expect(results).toContainEqual({
        transaction: `t_${transfer.donor}_${transfer.beneficiary}`,
        amount: transfer.amount,
        donor: transfer.donor,
        beneficiary: transfer.beneficiary,
        success: true,
        error: null
      }));
    });

    test('should return error results for transactions that fail to be created', async () => {
      // @ts-ignore
      const userService = {
        sendDonation: jest.fn()
          .mockResolvedValueOnce({ _id: 't1', donor: 'd1', beneficiary: 'b2', amount: 500 })
          .mockRejectedValueOnce(createAppError('Error 1', 'atApiError'))
          .mockResolvedValueOnce({ _id: 't2', donor: 'd1', beneficiary: 'b4', amount: 1000 })
          .mockRejectedValue(createAppError('Error 2', 'dbOpFailed'))
      } as UserService;

      const plan = [
        { donor: 'd1', beneficiary: 'b2', amount: 500 },
        { donor: 'd2', beneficiary: 'b3', amount: 1000 },
        { donor: 'd1', beneficiary: 'b4', amount: 1000 },
        { donor: 'd3', beneficiary: 'b1', amount: 500 }
      ];

      const results = await executeDistributionPlan(userService, plan);
      expect(results.length).toEqual(plan.length);
      
      const expectedResults = [
        {
          transaction: 't1',
          donor: 'd1',
          beneficiary: 'b2',
          amount: 500,
          success: true,
          error: null as any
        },
        {
          transaction: null,
          donor: 'd2',
          beneficiary: 'b3',
          amount: 1000,
          success: false,
          error: { code: 'atApiError', message: 'Error 1' }
        },
        {
          transaction: 't2',
          donor: 'd1',
          beneficiary: 'b4',
          amount: 1000,
          success: true,
          error: null as any
        },
        {
          transaction: null,
          donor: 'd3',
          beneficiary: 'b1',
          amount: 500,
          success: false,
          error: { code: 'dbOpFailed', message: 'Error 2' }
        },
      ];

      expectedResults.forEach(expected => expect(results).toContainEqual(expected));
    });
  });
});

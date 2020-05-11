import { Db } from 'mongodb';
import { DonationDistributionEvent, DonationDistributionArgs  } from './types';
import { UserService } from '../user';
import { BatchJobQueue } from '../batch-job-queue';

const USERS_COLL = 'users';
const TRANSACTIONS_COLL = 'transactions';

interface EligibleBeneficiary {
  _id: string;
  donors: string[];
  totalReceived: number;
  remaining: number;
};

interface DonorBalance {
  _id: string;
  balance: number;
}

interface DistributionPlanTransfer {
  donor: string,
  beneficiary: string,
  amount: number
}

interface DistributionPlanDonorsSummaries {
  [id: string]: {
    toSpend: number;
    remainingBalance: number;
  }
}

interface DistributionPlanBeneficiariesSummaries {
  [id: string]: {
    toReceive: number;
    remainingEligible: number;
  }
}

type DistributionPlan = DistributionPlanTransfer[];

interface CreateDistributionPlanResult {
  transfers: DistributionPlan,
  donorsSummaries: DistributionPlanDonorsSummaries;
  beneficiariesSummaries:DistributionPlanBeneficiariesSummaries;
}

export async function runDonationDistribution(db: Db, args: DonationDistributionArgs): Promise<DonationDistributionEvent[]> {
  const { periodLength, periodLimit, users } = args;

  const beneficiaries = await findEligibleBeneficiaries(db, periodLimit, periodLength);
  const donorIds = beneficiaries.reduce<string[]>((acc, b) => [...acc, ...b.donors], []);
  const donors = await computeDonorsBalances(db, Array.from(new Set(donorIds)));
  const plan = createDistributionPlan(beneficiaries, donors);
  const result = await executeDistributionPlan(users, plan.transfers);
  return result;
}

/**
 * finds beneficiaries eligible for receiving donations
 * a beneficiary is eligible if the amount of donations received
 * within the period is less than the limit
 * @param periodLimit maximum amount of donations per period
 * @param periodLength duration of a period in days
 */
export async function findEligibleBeneficiaries(db: Db, periodLimit: number, periodLength: number): Promise<EligibleBeneficiary[]> {
  const periodMilliseconds = periodLength * 24 * 3600 * 1000;
  const result = db.collection(USERS_COLL).aggregate<EligibleBeneficiary>([
    { 
      $match: { roles: 'beneficiary' }
    },
    { 
      $lookup: {
        from: TRANSACTIONS_COLL,
        let: { user: '$_id' },
        pipeline: [
          { // filter transactions to this user within the last period
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$to', '$$user']},
                  // we take a conservative approach and assume that any distribution
                  // that has not failed will potentially succeed
                  // if it's a pending transaction that eventually fails, then this
                  // means that the beneficiary will be entitled to less funds than they're supposed to
                  // in that case, then hopefully the status will updated by the time the next distribution runs
                  // it's better than giving the beneficiary more money (in case the transaction succeeds)
                  // because that's practically irreversible
                  { $ne: ['$status', 'failed']},
                  { $lt: [{ $subtract: [new Date(), '$updatedAt'] }, periodMilliseconds]}
                ]
              }
            },
          },
          { $group: { _id: null, totalReceived: { $sum: '$amount' } } },
          { $project: { _id: 0 } }
        ],
        as: 'transactions'
      }
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: ['$transactions', 0] }, '$$ROOT' ] } }
    },
    // only take beneficiaries who have not exceeded their period limit
    {
      $match: { totalReceived: { $lt: periodLimit } }
    },
    {
      $project: { _id: 1, donors: 1, totalReceived: 1, remaining: { $subtract: [periodLimit, '$totalReceived']} }
    }
  ]);

  return result.toArray();
}

export async function computeDonorsBalances(db: Db, donors: string[]): Promise<DonorBalance[]> {
  const result = db.collection(USERS_COLL).aggregate<DonorBalance>([
    {
      $match: { _id: { $in: donors }, roles: 'donor' }
    },
    {
      $lookup: {
        from: TRANSACTIONS_COLL,
        let: { user: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    // for the transactions to the user's account
                    // any non-successful transaction (e.g. pending)
                    // will potentially fail and should not be added to the balance
                    $and: [
                      { $eq: ['$to', '$$user'] },
                      { $eq: ['$status', 'success'] }
                    ]
                  },
                  {
                    // for transactions from the user
                    // any transaction that has not yet failed
                    // will potentially succeed and should be deducted from the balance calculation
                    $and: [
                      { $eq: ['$from', '$$user'] },
                      { $ne: ['$status', 'failed'] }
                    ]
                  }
                ]
              }
            },
          },
          {
            $group: {
              _id: {
                $cond: { if: { $eq: ['$to', '$$user'] }, then: 1, else: -1 }
              },
              total: { $sum: '$amount' }
            }
          },
          {
            $group: { _id: null, balance: { $sum: { $multiply: ['$_id', '$total'] } } }
          }
        ],
        as: 'transactions'
      }
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: ['$transactions', 0] }, '$$ROOT' ] } }
    },
    {
      $project: { _id: 1, balance: 1 }
    }
  ]);

  return result.toArray();
}

export function createDistributionPlan(beneficiaries: EligibleBeneficiary[], donors: DonorBalance[]): CreateDistributionPlanResult {
  const transfers: DistributionPlanTransfer[] = [];

  const beneficiariesSummaries = beneficiaries.reduce((acc, b) => ({
    ...acc,
    [b._id]: { toReceive: 0, remainingEligible: b.remaining }
  }), {} as DistributionPlanBeneficiariesSummaries);

  const donorsSummaries = donors.reduce((acc, d) => ({
    ...acc,
    [d._id]: { toSpend: 0, remainingBalance: d.balance }
  }), {} as DistributionPlanDonorsSummaries);

  beneficiaries.forEach((beneficiary) => {
    beneficiary.donors.forEach((donor) => {
      const beneficiarySummary = beneficiariesSummaries[beneficiary._id];
      const donorSummary = donorsSummaries[donor];

      const amount = Math.min(beneficiarySummary.remainingEligible, donorSummary.remainingBalance);
      if (amount === 0) return;

      beneficiarySummary.remainingEligible -= amount;
      beneficiarySummary.toReceive += amount;
      donorSummary.remainingBalance -= amount;
      donorSummary.toSpend += amount;

      transfers.push({
        beneficiary: beneficiary._id,
        donor,
        amount
      });
    });
  })

  return {
    beneficiariesSummaries,
    donorsSummaries,
    transfers
  };
}

export function executeDistributionPlan(userService: UserService, plan: DistributionPlan): Promise<DonationDistributionEvent[]> {
  const events: DonationDistributionEvent[] = [];
  const queue = new BatchJobQueue<DistributionPlanTransfer>(async (transfer) => {
    const event = await executeTransfer(userService, transfer);
    events.push(event);
  });
  
  return new Promise((resolve) => {
    queue.on('done', () => {
      resolve(events);
    });

    plan.forEach(transfer => queue.push(transfer));
    queue.signalEof();
  });
}

async function executeTransfer(userService: UserService, transfer: DistributionPlanTransfer): Promise<DonationDistributionEvent> {
  try {
    const trx = await userService.sendDonation(transfer.donor, transfer.beneficiary, { amount: transfer.amount });
    return {
      donor: transfer.donor,
      beneficiary: transfer.beneficiary,
      amount: transfer.amount,
      transaction: trx._id,
      success: true,
      error: null
    };
  }
  catch (e) {
    return {
      donor: transfer.donor,
      beneficiary: transfer.beneficiary,
      amount: transfer.amount,
      transaction: null,
      success: false,
      error: {
        code: e.code,
        message: e.message
      }
    };
  }
}
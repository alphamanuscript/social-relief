import { Db, Collection } from 'mongodb';
import { DonationDistributor, DonationDistributionResults  } from './types';
import { Transaction } from '../payment';
import { User } from '../user';

const USERS_COLL = 'users';
const TRANSACTIONS_COLL = 'transactions';

/*
PSEUDO CODE

async function distributeDonations() {
  create some global lock on the app that will prevent the app from running any
  operation that could conflict with the process, e.g. operations like refunds that may deduct
  the funds from users account, which would mess up the calculation of the balance

  find Beneficiaries Who Have Not Reached Their Term Limit And Calculate Their Remainder();
  get the donors for each beneficiary and calculate their balances
  create map beneficiary -> remainingFunds
  create map donor -> remainingBalance

  init empty list/distribution plan of planned transactions { donor, beneficiary, amount }

  for each beneficiary:
    for each donor:
      deduct upto beneficiary remaining (update donor and beneficiary map)
      push result in distribution plan
  
  push list to transaction queue
  transaction queue pulls items from the queue and executes the transactions
  results should be logged, including start time and stop time
}

*/

export class Distributor implements DonationDistributor {
  private transactions: Collection<Transaction>;
  private users: Collection<User>;

  constructor(db: Db) {
    this.transactions = db.collection(USERS_COLL);
    this.users = db.collection(USERS_COLL);
  }
  start(): Promise<DonationDistributionResults> {
    throw new Error('Not implemented');
  }
}

/**
 * finds beneficiaries eligible for receiving donations
 * a beneficiary is eligible if the amount of donations received
 * within the period is less than the limit
 * @param periodLimit maximum amount of donations per period
 * @param periodLength duration of a period in days
 */
export async function findEligibleBeneficiaries(users: Collection<User>, periodLimit: number, periodLength: number) {
  const periodMilliseconds = periodLength * 24 * 3600 * 1000;
  const result = await users.aggregate([
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
                  { $eq: ['$status', 'success']},
                  { $lt: [{ $subtract: [new Date(), '$updatedAt'] }, periodMilliseconds]}
                ]
              }
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
          { $project: { _id: 0 } }
        ],
        as: 'transactions'
      }
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: ['$transactions', 0] }, '$$ROOT' ] } }
    },
    {
      $project: { _id: 1, donors: 1, total: 1, remaining: { $subtract: [periodLimit, '$total' ]} }
    },
    {
      $match: { total: { $lt: periodLimit } }
    }
  ]);

  return result.toArray();
}

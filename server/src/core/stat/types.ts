import { UserService } from '../user';
import { TransactionService } from '../payment'

export interface StatsArgs {
  users: UserService;
  transactions: TransactionService
}

export interface Stat {
  _id: string,
  numContributors: number,
  totalContributed: number,
  numBeneficiaries: number, 
  totalDistributed: number,
  createdAt: Date,
  updatedAt: Date
}

export interface DbStat extends Stat {}

export interface StatCreateArgs {
  numContributors: number,
  totalContributed: number,
  numBeneficiaries: number, 
  totalDistributed: number,
}

export interface StatUpdateArgs extends StatCreateArgs {}

export interface StatService {
  /**
   * retrieves the one stat document 
   * in the database
   */
  get(): Promise<Stat>;
}
import { UserService } from '../user';
import { TransactionService } from '../payment'

export interface StatsArgs {
  users: UserService;
  transactions: TransactionService
}

export interface Stats {
  _id: string,
  numContributors: number,
  totalContributed: number,
  numBeneficiaries: number, 
  totalDistributed: number,
  updatedAt: Date
}

export interface StatsCreateArgs {
  numContributors: number,
  totalContributed: number,
  numBeneficiaries: number, 
  totalDistributed: number,
}

export interface StatsUpdateArgs extends StatsCreateArgs {}

export interface StatsService {
  /**
   * retrieves the one stats document 
   * in the database
   */
  get(): Promise<Stats>;
  /**
   * updates the stats document
   */
  update(): Promise<Stats>;
}
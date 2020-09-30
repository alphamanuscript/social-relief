import { UserService } from '../user';
import { SystemLockService } from '../system-lock';
import { BeneficiaryFilter } from '.';

export interface DonationDistributionArgs {
  /**
   * maximum funds a beneficiary can receive in a given period
   */
  periodLimit: number;
  /**
   * length of a period in days
   */
  periodLength: number;
  users: UserService;
  systemLocks: SystemLockService;
}

export interface BeneficiaryFilter {
  isVetted: Object | boolean;
  beneficiaryStatus: Object | boolean;
}

export interface DonationDistributionEvent {
  donor: string;
  beneficiary: string;
  amount: number;
  transaction: string;
  success: boolean;
  error: {
    code: string;
    message: string;
  };
}

export interface DonationDistributionResults {
  _id: string;
  startedAt: Date;
  finishedAt: Date;
  distributions: DonationDistributionEvent[];
}

export interface DonationDistributor {
  run(): Promise<DonationDistributionEvent[]>
}

export interface DonationDistributionService {
  distributeDonations(constraint?: BeneficiaryFilter): Promise<DonationDistributionResults>;
}
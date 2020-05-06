
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
  start(): Promise<DonationDistributionResults>
}

export interface DonationDistributionService {
  distributionDonations(): Promise<DonationDistributionResults>;
}
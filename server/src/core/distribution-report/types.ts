import { SmsProvider } from '../sms';
import { EmailProvider } from '../email';
import { UserService } from '../user';


export interface DistributionReport {
  donor: string,
  beneficiaries: string[],
  receivedAmount: number[],
  totalDistributedAmount: number,
  createdAt: Date
}

export interface DistributionReportArgs {
  smsProvider: SmsProvider;
  emailProvider: EmailProvider;
  users: UserService;
}

export interface DistributionReportService {
  /**
   * Generates a 24-hour distribution report doc for every donor, 
   * indicating who benefited from such distributions, 
   * how much they received, and how much was distributed in total.
   */
  sendDistributionReportsToDonors(): Promise<void>;
}
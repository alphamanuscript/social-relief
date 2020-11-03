import { SmsProvider } from '../sms';
import { EmailProvider } from '../email';
import { UserService } from '../user';
import { TransactionService } from '../payment';

export interface DistributionReportArgs {
  smsProvider: SmsProvider;
  emailProvider: EmailProvider;
  users: UserService;
  transactions: TransactionService;
}

export interface SmsAndEmailMessages {
  sms: string;
  email: string;
}

export interface DistributionReportService {
  /**
   * Generates a 24-hour distribution report doc for every donor, 
   * indicating who benefited from such distributions, 
   * how much they received, and how much was distributed in total.
   */
  sendDistributionReportsToDonors(): Promise<void>;
}
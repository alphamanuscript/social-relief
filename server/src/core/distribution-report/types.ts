import { SmsProvider } from '../sms';
import { EmailProvider } from '../email';
import { UserService } from '../user';
import { TransactionService } from '../payment';
import { Links } from '../link-generator';

export type ReportType = 'daily' | 'monthly';

export interface DistributionReportArgs {
  smsProvider: SmsProvider;
  emailProvider: EmailProvider;
  users: UserService;
  transactions: TransactionService;
  links: Links
}

export interface DistributionReportService {
  /**
   * Generates a 24-hour distribution report doc for every donor, 
   * indicating who benefited from such distributions, 
   * how much they received, and how much was distributed in total.
   */
  sendDistributionReportsToDonors(reportType?: ReportType): Promise<void>;
}
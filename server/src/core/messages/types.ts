import { DistributionReport } from '../payment';
import { User } from '../user';


export type MessageType = 'sms' | 'email';

export interface MessageService {
  createDistributionReportForDonorMessage(report: DistributionReport, donor: User, beneficiaries: User[], type: MessageType): string;
}
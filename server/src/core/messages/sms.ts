import { DistributionReport } from '../payment';
import { User } from '../user';

export const SmsMessages = {
  createDistributionReportForDonorMessage(report: DistributionReport, donor: User, beneficiaries: User[]) {
    const sms = `Hello ${donor.name},
                \nIn the last 24 hours, Ksh ${report.totalDistributedAmount} has been transferred 
                from your SocialRelief donation to the following beneficiaries:
                ${this.beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}
                \nOn behalf of all beneficiaries, we at SocialRelief say thank you!
                \nIf you wish to donate more, click ${this.generateDonateLink(donor, report.totalDistributedAmount)}`;
  }
}
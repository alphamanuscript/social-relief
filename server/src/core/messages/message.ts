import { DistributionReport } from '../payment';
import { User } from '../user';
import { extractFirstName } from '../util';
import { Links } from '../link-generator';

interface MessageArgs {
  links: Links
}

export class Messages implements MessageService {
  private args: MessageArgs;

  constructor(args: MessageArgs) {
    this.args = args;
  }
}

// export const Messages = {
//   createDistributionReportMessageForDonor(report: DistributionReport, donor: User, beneficiaries: User[], messageType: ) {
//     const sms = `Hello ${extractFirstName(donor.name)}, Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}. Thank you for your contribution. To donate again, go to ${this.generateDonateLink(donor, report.totalDistributedAmount)}`;
//     return sms;
//   }
//   createDistribution
// }

// function beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmount: number[]): string {
//   let message: string = '';
//   beneficiaries.forEach((beneficiary: User, index: number) => {
//     message += `${extractFirstName(beneficiary.name)} (${receivedAmount[index]})` + ((index < beneficiaries.length - 1) ? ', ' : '');
//   });
//   return message;
// }
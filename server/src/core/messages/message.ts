import { DistributionReport } from '../payment';
import { User } from '../user';
import { extractFirstName } from '../util';
import { beneficiariesAndAmountReceived } from './util';
import { Links } from '../link-generator';
import { MessageType, MessageService } from './types';

interface MessageArgs {
  links: Links
}

export class Messages implements MessageService {
  private args: MessageArgs;

  constructor(args: MessageArgs) {
    this.args = args;
  }

  public createDistributionReportMessageForDonor(report: DistributionReport, donor: User, beneficiaries: User[], type: MessageType) {
    if (type === 'sms') {
      return this.createDistributionReportSmsMessage(report, donor, beneficiaries);
    }
    else if (type === 'email') {
      return this.createDistributionReportEmailMessage(report, donor, beneficiaries);
    }
  }

  private createDistributionReportSmsMessage(report: DistributionReport, donor: User, beneficiaries: User[]): string {
    return `Hello ${extractFirstName(donor.name)}, Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}. Thank you for your contribution. To donate again, click this <a href='${this.args.links.getUserDonateLink(donor, report.totalDistributedAmount)}' target="_blank">link</a>`;
  }

  private createDistributionReportEmailMessage(report: DistributionReport, donor: User, beneficiaries: User[]): string {
    return `<p>
               Hello ${extractFirstName(donor.name)}, <br><br>
               Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}. <br>
               Thank you for your contribution. To donate again, click this <a href='${this.args.links.getUserDonateLink(donor, report.totalDistributedAmount)}' target="_blank">link</a>
            </p>`;
  }
}
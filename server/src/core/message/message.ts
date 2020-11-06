import { DistributionReport } from '../payment';
import { User } from '../user';
import { extractFirstName } from '../util';

export function createDistributionReportSmsMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `Hello ${extractFirstName(donor.name)}, Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}. Thank you for your contribution. To donate again, click ${donateLink}`;
}

export function createDistributionReportEmailMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `<p>
              Hello ${extractFirstName(donor.name)}, <br><br>
              Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}. <br>
              Thank you for your contribution. To donate again, click this <a href='${donateLink}' target="_blank">link</a>
          </p>`;
}

function beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmount: number[]): string {
  let message: string = '';
  beneficiaries.forEach((beneficiary: User, index: number) => {
    message += `${extractFirstName(beneficiary.name)} (${receivedAmount[index]})` + ((index < beneficiaries.length - 1) ? ', ' : '');
  });
  return message;
}
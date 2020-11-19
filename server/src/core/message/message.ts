import { DistributionReport } from '../payment';
import { User } from '../user';
import { extractFirstName } from '../util';

type MessageType = 'sms' | 'email';

export function createDistributionReportSmsMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `Hello ${extractFirstName(donor.name)}, Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'sms')}. Thank you for your contribution. To donate again, click ${donateLink}`;
}

export function createMonthlyDistributionReportSmsMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `Hello ${extractFirstName(donor.name)}, Ksh ${report.totalDistributedAmount} was transferred last month from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'sms')}. Thank you for your contribution. To donate again, click ${donateLink}`;
}

export function createDistributionReportEmailMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `<p>
            Hello ${extractFirstName(donor.name)}, <br><br>
            Ksh ${report.totalDistributedAmount} has been transferred from your SocialRelief donation to:<br>
            ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'email')}.<br>
            Thank you for your contribution.<br>
            To donate again, click <a href='${donateLink}' target="_blank">here</a><br><br>
            Regards,<br>
            Social Relief Team
          </p>`;
}

export function createMonthlyDistributionReportEmailMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `<p>
            Hello ${extractFirstName(donor.name)}, <br><br>
            Ksh ${report.totalDistributedAmount} was transferred last month from your SocialRelief donation to:<br>
            ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'email')}.<br>
            Thank you for your contribution.<br>
            To donate again, click <a href='${donateLink}' target="_blank">here</a><br><br>
            Regards,<br>
            Social Relief Team
          </p>`;
}

function beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmount: number[], type: MessageType): string {
  if (type === 'sms') {
    return beneficiariesAndAmountReceivedForSms(beneficiaries, receivedAmount);
  }
    else if (type === 'email') {
      return beneficiariesAndAmountReceivedForEmail(beneficiaries, receivedAmount);
  }
}

function beneficiariesAndAmountReceivedForSms(beneficiaries: User[], receivedAmount: number[]) {
  let message: string = '';
  beneficiaries.forEach((beneficiary: User, index: number) => {
    message += `${extractFirstName(beneficiary.name)} (${receivedAmount[index]})` + ((index < beneficiaries.length - 1) ? ', ' : '');
  });
  return message;
}

function beneficiariesAndAmountReceivedForEmail(beneficiaries: User[], receivedAmount: number[]) {
  let message: string = '<ul>';
  beneficiaries.forEach((beneficiary: User, index: number) => {
    message += `<li>${extractFirstName(beneficiary.name)} (${receivedAmount[index]})</li>`;
  });
  return `${message}</ul>`;
}
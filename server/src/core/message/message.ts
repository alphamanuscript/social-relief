import { ReportType, REPORT_TYPE_DAILY, REPORT_TYPE_MONTHLY } from '../distribution-report';
import { DistributionReport } from '../payment';
import { User } from '../user';
import { extractFirstName } from '../util';

type MessageType = 'sms' | 'email';

export function createDailyDistributionReportSmsMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `Hello ${extractFirstName(donor.name)}, Ksh ${report.totalDistributedAmountFromDonor} has been transferred from your SocialRelief donation to ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'sms')}. Thank you for your contribution. To donate again, click ${donateLink}`;
}

export function createDailyDistributionReportEmailMessage(report: DistributionReport, donor: User, beneficiaries: User[], donateLink: string): string {
  return `<p>
            Hello ${extractFirstName(donor.name)}, <br><br>
            Ksh ${report.totalDistributedAmountFromDonor} has been transferred from your SocialRelief donation to:<br>
            ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'email')}.<br>
            Thank you for your contribution.<br>
            To donate again, click <a href='${donateLink}' target="_blank">here</a><br><br>
            Regards,<br>
            Social Relief Team
          </p>`;
} 

export function createMonthlyDistributionReportSmsMessageForContributingDonor(report: DistributionReport, donor: User, beneficiaries: User[], totalDonationsFromAllDonors: number, donateLink: string): string {
  return `Hello ${extractFirstName(donor.name)}, A total of Ksh ${totalDonationsFromAllDonors} was transferred last month, of which Ksh ${report.totalDistributedAmountFromDonor} came from your SocialRelief donation and went to ${report.beneficiaries.length} beneficiaries, including ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'sms')}. Thank you for your contribution. To donate again, click ${donateLink}`;
}

export function createMonthlyDistributionReportEmailMessageForContributingDonor(report: DistributionReport, donor: User, beneficiaries: User[], totalDonationsFromAllDonors: number, donateLink: string): string {
  return `<p>
            Hello ${extractFirstName(donor.name)}, <br><br>
            A total of Ksh ${totalDonationsFromAllDonors} was transferred last month, of which Ksh ${report.totalDistributedAmountFromDonor} came from your SocialRelief donation and went to ${report.beneficiaries.length} beneficiaries, including:<br>
            ${beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, 'email')}.<br>
            Thank you for your contribution.<br>
            To donate again, click <a href='${donateLink}' target="_blank">here</a><br><br>
            Regards,<br>
            Social Relief Team
          </p>`;
}

export function createMonthlyDistributionReportSmsMessageForOccasionalDonor(donor: User, totalDonationsFromAllDonors: number, totalNumberOfContributingDonors: number, totalNumberOfBeneficiaries: number, donateLink: string) {
  return `Hello ${extractFirstName(donor.name)}, A total of Ksh ${totalDonationsFromAllDonors} was transferred last month from ${totalNumberOfContributingDonors} donors to ${totalNumberOfBeneficiaries} beneficiaries. If you would like to donate, click ${donateLink}`;
}

export function createMonthlyDistributionReportEmailMessageForOccasionalDonor(donor: User, totalDonationsFromAllDonors: number, totalNumberOfContributingDonors: number, totalNumberOfBeneficiaries: number, donateLink: string) {
  return `<p>
            Hello ${extractFirstName(donor.name)}, <br><br>
            A total of Ksh ${totalDonationsFromAllDonors} was transferred last month from ${totalNumberOfContributingDonors} donors to ${totalNumberOfBeneficiaries} beneficiaries.<br> 
            If you would like to donate, click <a href='${donateLink}' target="_blank">here</a><br><br>
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
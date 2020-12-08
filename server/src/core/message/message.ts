import { EnhancedDistributionReport } from '../distribution-report';
import { DistributionReport, MonthlyDistributionReport } from '../payment';
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

export function createMonthlyDistributionReportSmsMessageForContributingDonor(donorsReport: EnhancedDistributionReport, systemWideReport: MonthlyDistributionReport, donateLink: string): string {
  return `Hello ${extractFirstName(donorsReport.donor.name)}, last month a total of Ksh ${systemWideReport.totalDonations} was donated by ${systemWideReport.distributionReports.length} Social Relief donors to ${systemWideReport.totalBeneficiaries} beneficiaries. Ksh ${donorsReport.totalDistributedAmountFromDonor} was sent from your donations to ${beneficiariesAndAmountReceived(donorsReport.beneficiaries, donorsReport.receivedAmount, 'sms')}. Thank you for your contribution. To donate again, click ${donateLink}`;
}

export function createMonthlyDistributionReportEmailMessageForContributingDonor(donorsReport: EnhancedDistributionReport, systemWideReport: MonthlyDistributionReport, donateLink: string): string {
  return `<p>
            Hello ${extractFirstName(donorsReport.donor.name)}, <br><br>
            Last month a total of Ksh ${systemWideReport.totalDonations} was donated by ${systemWideReport.distributionReports.length} Social Relief donors to ${systemWideReport.totalBeneficiaries} beneficiaries. Ksh ${donorsReport.totalDistributedAmountFromDonor} was sent from your donations to:<br>
            ${beneficiariesAndAmountReceived(donorsReport.beneficiaries, donorsReport.receivedAmount, 'email')}.<br>
            Thank you for your contribution.<br>
            To donate again, click <a href='${donateLink}' target="_blank">here</a><br><br>
            Regards,<br>
            Social Relief Team
          </p>`;
}

export function createMonthlyDistributionReportSmsMessageForOccasionalDonor(donor: User, systemWideReport: MonthlyDistributionReport, donateLink: string) {
  return `Hello ${extractFirstName(donor.name)}, last month a total of Ksh ${systemWideReport.totalDonations} was donated by ${systemWideReport.distributionReports.length} Social Relief donors to ${systemWideReport.totalBeneficiaries} beneficiaries. To donate again, click ${donateLink}`;
}

export function createMonthlyDistributionReportEmailMessageForOccasionalDonor(donor: User, systemWideReport: MonthlyDistributionReport, donateLink: string) {
  return `<p>
            Hello ${extractFirstName(donor.name)}, <br><br>
            Last month a total of Ksh ${systemWideReport.totalDonations} was donated by ${systemWideReport.distributionReports.length} Social Relief donors to ${systemWideReport.totalBeneficiaries} beneficiaries.<br>
            To donate again, click <a href='${donateLink}' target="_blank">here</a><br><br>
            Regards,<br>
            Social Relief Team
          </p>`;
}

export function createPhoneVerificationSms(user: User, verificationLink: string): string {
  return `Hello ${extractFirstName(user.name)}, before you can start making donations, you need to confirm your phone number by clicking ${verificationLink}`
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
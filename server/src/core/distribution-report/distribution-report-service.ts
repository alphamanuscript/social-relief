import { Db, Collection } from 'mongodb';
import { DistributionReportService, DistributionReportArgs, ReportType } from './types';
import { rethrowIfAppError, createDbOpFailedError } from '../error';
import { User } from '../user';
import { DistributionReport } from '../payment';
import { createDailyDistributionReportSmsMessage, createMonthlyDistributionReportSmsMessageForContributingDonor, 
         createDailyDistributionReportEmailMessage, createMonthlyDistributionReportEmailMessageForContributingDonor,
         createMonthlyDistributionReportSmsMessageForOccasionalDonor, createMonthlyDistributionReportEmailMessageForOccasionalDonor } from '../message';

const COLLECTION = 'distribution_reports';
export const REPORT_TYPE_DAILY = 'daily';
export const REPORT_TYPE_MONTHLY = 'monthly';

export class DistributionReports implements DistributionReportService {
  private db: Db;
  private collection: Collection<DistributionReport>;
  private args: DistributionReportArgs;

  constructor(db: Db, args: DistributionReportArgs) {
    this.db = db;
    this.collection = db.collection(COLLECTION);
    this.args = args;
  }

  async sendDailyDistributionReportsToDonors(): Promise<void> {
    try {
      const lastDailyReportDate = await this.getLastDailyDistributionReportDate();
      console.log('last daily report date: ', lastDailyReportDate);
      const reports: DistributionReport[] = await this.args.transactions.generateDailyDistributionReportDocs(lastDailyReportDate);
      await this.sendDailyDistributionReportMessages(reports);
      if (reports.length) {
        await this.collection.insertMany(reports);
      }
    }
    catch (e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async sendMonthlyDistributionReportsToDonors(): Promise<void> {
    try {
      const lastMonthlyReportDate = await this.getLastMonthlyDistributionReportDate();
      console.log('last monthly report date: ', lastMonthlyReportDate);
      const reports: DistributionReport[] = await this.args.transactions.generateMonthlyDistributionReportDocs(lastMonthlyReportDate);
      await this.sendMonthlyDistributionReportMessages(reports);
      if (reports.length) {
        await this.collection.insertMany(reports);
      }
    }
    catch (e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async sendDailyDistributionReportMessages(reportDocs: DistributionReport[]) {
    try {
      reportDocs.forEach(async (report: DistributionReport) => {
        const donor = await this.args.users.getById(report.donor);
        const beneficiaries = await this.getBeneficiaries(report.beneficiaries);

        const amount = report.totalDistributedAmountFromDonor < 2000 ? 2000 : report.totalDistributedAmountFromDonor;
        const donateLink = await this.args.links.getUserDonateLink(donor, amount);
        const smsMessage = createDailyDistributionReportSmsMessage(report, donor, beneficiaries, donateLink);
        const emailMessage = createDailyDistributionReportEmailMessage(report, donor, beneficiaries, donateLink);

        await Promise.all([
          this.args.smsProvider.sendSms(donor.phone, smsMessage),
          this.args.emailProvider.sendEmail(donor.email, emailMessage, 'SocialRelief Donation Report'),
        ]);                 
      });
    }
    catch (e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async sendMonthlyDistributionReportMessages(reportDocs: DistributionReport[]) {
    await Promise.all([
      this.sendMonthlyDistributionReportMessagesToContributingDonors(reportDocs),
      this.sendMonthlyDistributionReportMessagesToOccasionalDonors(reportDocs)
    ]);
  }

  private async sendMonthlyDistributionReportMessagesToContributingDonors(reportDocs: DistributionReport[]): Promise<void> {
    try {
      reportDocs.forEach(async (report: DistributionReport) => {
        const donor = await this.args.users.getById(report.donor);
        const beneficiaries = await this.getBeneficiaries(report.beneficiaries);

        const amount = report.totalDistributedAmountFromDonor < 2000 ? 2000 : report.totalDistributedAmountFromDonor;
        const donateLink = await this.args.links.getUserDonateLink(donor, amount);
        const smsMessage = createMonthlyDistributionReportSmsMessageForContributingDonor(report, donor, beneficiaries, donateLink);
        const emailMessage = createMonthlyDistributionReportEmailMessageForContributingDonor(report, donor, beneficiaries, donateLink);

        await Promise.all([
          this.args.smsProvider.sendSms(donor.phone, smsMessage),
          this.args.emailProvider.sendEmail(donor.email, emailMessage, 'SocialRelief Donation Report'),
        ]);                 
      });
    }
    catch (e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async sendMonthlyDistributionReportMessagesToOccasionalDonors(reportDocs: DistributionReport[]): Promise<void> {
    try {
      if (reportDocs.length) {
        const donorsWithNoConstributions = await this.getDonorsWithNoContributionsInPreviousMonth(reportDocs);
        console.log('donorsWithNoConstributions: ', donorsWithNoConstributions);
        const totalDistributedAmount = reportDocs[0].totalDistributedAmountFromAllDonors;
        const totalNumberOfContributingDonors = reportDocs.length;
        const totalNumberOfBeneficiaries = reportDocs[0].totalBeneficiaries;
        donorsWithNoConstributions.forEach(async (donor) => {
          const donateLink = await this.args.links.getUserDonateLink(donor, 2000);
          const smsMessage = createMonthlyDistributionReportSmsMessageForOccasionalDonor(donor, totalDistributedAmount, totalNumberOfContributingDonors, totalNumberOfBeneficiaries, donateLink);
          const emailMessage = createMonthlyDistributionReportEmailMessageForOccasionalDonor(donor, totalDistributedAmount, totalNumberOfContributingDonors, totalNumberOfBeneficiaries, donateLink);
        });
      }
    }
    catch (e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async getBeneficiaries(beneficiaryIds: string[]): Promise<User[]> {
    const beneficiaries: User[] = [];

    for (const id of beneficiaryIds) {
      const beneficiary: User = await this.args.users.getById(id);
      beneficiaries.push(beneficiary);
    }

    return beneficiaries;
  }

  private async getDonorsWithNoContributionsInPreviousMonth(reports: DistributionReport[]): Promise<User[]> {
    let donorsWithoutContributions: User[] = [];

    try {
      const donors = await this.args.users.getAllDonors();
      donorsWithoutContributions = donors.filter(donor => {
        let isNotIncluded = true;
        reports.forEach(report => {
          if (report.donor === donor._id) {
            isNotIncluded = false;
          }
        });
        return isNotIncluded;
      });
      return donorsWithoutContributions;
    }
    catch (e) {
      console.error("Error occured: ", e.message);
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async getLastMonthlyDistributionReportDate(): Promise<Date> {
    const reports = await this.collection.aggregate([
      { $match: { reportType: REPORT_TYPE_MONTHLY } },
      { $sort: { createdAt : -1} }
    ]).toArray();

    if (reports.length) {
      return reports[0].createdAt;
    }

    const currentDate: Date = new Date();
    return new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  private async getLastDailyDistributionReportDate(): Promise<Date> {
    const reports = await this.collection.aggregate([
      { $match: { reportType: REPORT_TYPE_DAILY }},
      { $sort: { createdAt : -1} }
    ]).toArray();

    if (reports.length) {
      return reports[0].createdAt;
    }

    return new Date(new Date().getTime() - (1 * 24 * 3600 * 1000));
  }
}
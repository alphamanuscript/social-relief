import { Db, Collection } from 'mongodb';
import { DistributionReportService, DistributionReportArgs, ReportType } from './types';
import { rethrowIfAppError, createDbOpFailedError } from '../error';
import { User } from '../user';
import { DistributionReport } from '../payment';
import { createDistributionReportSmsMessage, createDistributionReportEmailMessage } from '../message';

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
      const reports: DistributionReport[] = await this.args.transactions.generateDistributionReportDocs(lastDailyReportDate);
      await this.sendDistributionReportMessages(reports);
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
      const reports: DistributionReport[] = await this.args.transactions.generateDistributionReportDocs(lastMonthlyReportDate, REPORT_TYPE_MONTHLY);
      console.log('reports: ', reports);
      await this.sendDistributionReportMessages(reports, REPORT_TYPE_MONTHLY);
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

  private async sendDistributionReportMessages(reportDocs: DistributionReport[], reportType: ReportType = REPORT_TYPE_DAILY): Promise<void> {
    try {
      console.log('reportType: ', reportType);
      reportDocs.forEach(async (report: DistributionReport) => {
        const donor = await this.args.users.getById(report.donor);
        const beneficiaries = await this.getBeneficiaries(report.beneficiaries);

        const amount = report.totalDistributedAmount < 2000 ? 2000 : report.totalDistributedAmount;
        const donateLink = await this.args.links.getUserDonateLink(donor, amount);
        console.log('donate: ', donateLink);
        const smsMessage = createDistributionReportSmsMessage(report, donor, beneficiaries, donateLink, reportType);
        console.log('smsMessage: ', smsMessage);
        const emailMessage = createDistributionReportEmailMessage(report, donor, beneficiaries, donateLink, reportType);
        console.log('emailMessage: ', emailMessage);

        await Promise.all([
          this.args.smsProvider.sendSms(donor.phone, smsMessage),
          this.args.emailProvider.sendEmail(donor.email, emailMessage, 'SocialRelief Donation Report'),
        ]);                 
      });
    }
    catch(error) {
      console.error('Error occurred when handling event', error);
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

  private async getLastMonthlyDistributionReportDate(): Promise<Date> {
    const reports = await this.collection.aggregate([
      { $match: { reportType: REPORT_TYPE_MONTHLY } },
      { $sort: { createdAt : -1} }
    ]).toArray();

    if (reports.length) {
      return reports[0].createdAt;
    }

    const currentDate: Date = new Date();
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
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
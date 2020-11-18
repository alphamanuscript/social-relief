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

  async sendDistributionReportsToDonors(type: ReportType = REPORT_TYPE_DAILY): Promise<void> {
    try {
      const lastReportDate = await this.getLastDistributionReportDate(type);
      console.log('last report date: ', lastReportDate);
      const reports: DistributionReport[] = await this.args.transactions.generateDistributionReportDocs(lastReportDate, type);
      await this.sendDistributionReportMessages(reports, type);
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
      reportDocs.forEach(async (report: DistributionReport) => {
        const donor = await this.args.users.getById(report.donor);
        const beneficiaries = await this.getBeneficiaries(report.beneficiaries);

        const amount = report.totalDistributedAmount < 2000 ? 2000 : report.totalDistributedAmount;
        const donateLink = await this.args.links.getUserDonateLink(donor, amount);
        const smsMessage = createDistributionReportSmsMessage(report, donor, beneficiaries, donateLink);
        const emailMessage = createDistributionReportEmailMessage(report, donor, beneficiaries, donateLink, reportType);

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

  private async getLastDistributionReportDate(reportType: ReportType = REPORT_TYPE_DAILY): Promise<Date> {
    const reports = await this.collection.aggregate([
      { $match: { reportType } },
      { $sort: { createdAt : -1} }
    ]).toArray();

    if (reports.length) {
      return reports[0].createdAt;
    }

    if (reportType === 'daily') {
      return new Date(new Date().getTime() - (1 * 24 * 3600 * 1000));
    }

    if (reportType === 'monthly') {
      const currentDate: Date = new Date();
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
  }
}
import { Db, Collection } from 'mongodb';
import { DistributionReportService, DistributionReportArgs } from './types';
import { rethrowIfAppError, createDbOpFailedError } from '../error';
import { User } from '../user';
import { DistributionReport } from '../payment';
import { createDistributionReportSmsMessage, createDistributionReportEmailMessage } from '../message';

const COLLECTION = 'distribution_reports';

export class DistributionReports implements DistributionReportService {
  private db: Db;
  private collection: Collection<DistributionReport>;
  private args: DistributionReportArgs;

  constructor(db: Db, args: DistributionReportArgs) {
    this.db = db;
    this.collection = db.collection(COLLECTION);
    this.args = args;
  }

  async sendDistributionReportsToDonors(): Promise<void> {
    try {
      const lastReportDate = await this.getLastDistributionReportDate();
      console.log('last report date: ', lastReportDate);
      const reports: DistributionReport[] = await this.args.transactions.generateDistributionReportDocs(lastReportDate);
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

  private async sendDistributionReportMessages(reportDocs: DistributionReport[]): Promise<void> {
    try {
      reportDocs.forEach(async (report: DistributionReport) => {
        const donor = await this.args.users.getById(report.donor);
        const beneficiaries = await this.getBeneficiaries(report.beneficiaries);

        const donateLink = this.args.links.getUserDonateLink(donor, report.totalDistributedAmount);
        // const smsMessage = createDistributionReportSmsMessage(report, donor, beneficiaries, donateLink);
        // const emailMessage = createDistributionReportEmailMessage(report, donor, beneficiaries, donateLink);

        // await Promise.all([
        //   this.args.smsProvider.sendSms(donor.phone, smsMessage),
        //   this.args.emailProvider.sendEmail(donor.email, emailMessage, 'SocialRelief Donation Report'),
        // ]);                 
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

  private async getLastDistributionReportDate(): Promise<Date> {
    // const reports = await this.collection.aggregate([{ $sort: { createdAt : -1} }]).toArray();
    // if (reports.length) {
    //   return reports[0].createdAt;
    // }

    return new Date(new Date().getTime() - (15 * 24 * 3600 * 1000));
  }
}
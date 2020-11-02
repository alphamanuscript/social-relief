import { Db, Collection } from 'mongodb';
import { DistributionReportService, DistributionReport, DistributionReportArgs } from './types';
import { rethrowIfAppError, createDbOpFailedError } from '../error';
import { User } from '../user';
import { extractFirstName } from '../util';

const COLLECTION = 'distributions_reports';

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
      const reports: DistributionReport[] = await this.generateDistributionReportDocs();
      await this.sendDistributionReportMessages(reports);
      await this.collection.insertMany(reports);
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  private async generateDistributionReportDocs(): Promise<DistributionReport[]> {
    try {
      const results: DistributionReport[] = await this.collection.aggregate<DistributionReport>([
        { 
          $match: { 
            type: 'distribution', 
            status: 'success', 
            updatedAt: { $gt: new Date(new Date().getTime() - (1 * 24 * 3600 * 1000)) } 
          } 
        },
        { 
          $group: {
            _id: {
              from: "$from",
              to: "$to"
            },
            receivedAmount: {
              $sum: "$amount"
            }
          }
        },
        { 
          $group: {
            _id: "$_id.from",
            beneficiaries: {
              $push: "$_id.to"
            },
            receivedAmount: {
              $push: "$receivedAmount"
            },
            totalDistributedAmount: {
              $sum: "$receivedAmount"
            }
          }
        },
        { 
          $project: {
            _id: 0,
            donor: "$_id",
            beneficiaries: 1,
            receivedAmount: 1,
            totalDistributedAmount: 1,
            createdAt: new Date()
          }
        }
      ]).toArray();

      return results;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  private async sendDistributionReportMessages(reportDocs: DistributionReport[]): Promise<void> {
    try {
      reportDocs.forEach(async (report: DistributionReport) => {
        const donor = await this.args.users.getById(report.donor);
        const beneficiaries = await this.getBeneficiaries(report.beneficiaries);
  
        // Compose message
        const donorMessage = `Hello ${donor.name},
                             \nIn the last 24 hours, Ksh ${report.totalDistributedAmount} has been transferred 
                             \nfrom your SocialRelief donation to the following beneficiaries:
                             ${this.beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}
                             \nOn behalf of these beneficiaries, we at SocialRelief say thank you!
                             \nIf you wish to donate more, click ${this.generateDonateLink(donor, report.totalDistributedAmount)}`;
  
        await Promise.all([
          this.args.smsProvider.sendSms(donor.phone, donorMessage),
          this.args.emailProvider.sendEmail(donor.email, donorMessage),
        ]);                 
      });
    }
    catch(error) {
      console.error('Error occurred when handling event', error);
    }
  }

  private generateDonateLink(user: User, totalDistributedAmount: number): string {
    const amount: number = totalDistributedAmount > 2000 ? totalDistributedAmount : null;
    let message = '';
    if (user.isAnonymous) {
      message = `<a href='socialrelief.co?donate=true&n=${user.name}&e=${user.email}&p=${user.phone}&a=${amount}'>here</a>`;
    }
    else {
      return `<a href='socialrelief.co?donate=true&a=${amount}'>here</a>`
    }
  }

  private beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmount: number[]): string {
    let message: string = '';
    beneficiaries.forEach((beneficiary: User, index: number) => {
      message += `\n${extractFirstName(beneficiary.name)}: Ksh ${receivedAmount[index]}`;
    });
    return message;
  }

  private async getBeneficiaries(beneficiaryIds: string[]): Promise<User[]> {
    const beneficiaries: User[] = [];

    for (const id of beneficiaryIds) {
      const beneficiary: User = await this.args.users.getById(id);
      beneficiaries.push(beneficiary);
    }

    return beneficiaries;
  }
}
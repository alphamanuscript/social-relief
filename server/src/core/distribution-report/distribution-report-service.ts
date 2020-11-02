import { Db, Collection } from 'mongodb';
import { DistributionReportService, DistributionReport, DistributionReportArgs, SmsAndEmailMessages } from './types';
import { rethrowIfAppError, createDbOpFailedError } from '../error';
import { User } from '../user';
import { extractFirstName } from '../util';

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

        const messages = this.getSmsAndEmailMessages(report, donor, beneficiaries);
  
        await Promise.all([
          this.args.smsProvider.sendSms(donor.phone, messages.sms),
          this.args.emailProvider.sendEmail(donor.email, messages.email),
        ]);                 
      });
    }
    catch(error) {
      console.error('Error occurred when handling event', error);
    }
  }

  private getSmsAndEmailMessages(report: DistributionReport, donor: User, beneficiaries: User[]): SmsAndEmailMessages {
    const sms = `Hello ${donor.name},
                \nIn the last 24 hours, Ksh ${report.totalDistributedAmount} has been transferred 
                \nfrom your SocialRelief donation to the following beneficiaries:
                ${this.beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount)}
                \nOn behalf of these beneficiaries, we at SocialRelief say thank you!
                \nIf you wish to donate more, click ${this.generateDonateLink(donor, report.totalDistributedAmount)}`;

    const email = `<p>
                  Hello ${donor.name},<br><br>
                  In the last 24 hours, Ksh ${report.totalDistributedAmount} has been transferred<br>
                  from your SocialRelief donation to the following beneficiaries:
                  ${this.beneficiariesAndAmountReceived(beneficiaries, report.receivedAmount, false)}<br>
                  On behalf of these beneficiaries, we at SocialRelief say thank you!<br>
                  If you wish to donate more, click ${this.generateDonateLink(donor, report.totalDistributedAmount)}
                  </p>`;

    return { sms, email };
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

  private beneficiariesAndAmountReceived(beneficiaries: User[], receivedAmount: number[], isForSms: boolean = true): string {
    let message: string = '';
    beneficiaries.forEach((beneficiary: User, index: number) => {
      message += (isForSms ? '\n' : '<br>') + `${extractFirstName(beneficiary.name)}: Ksh ${receivedAmount[index]}`;
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
import { App } from '../core';
import { CronJob } from 'cron';

export function runVettedBeneficiaryDistributionWorker(app: App, intervalMinutes: number) {
  const job = new CronJob(`* ${intervalMinutes} * * * * *`, async () => {
    console.log(`Starting distribution process for vetted beneficiaries at ${new Date()}...`);
    const result = await app.donationDistributions.distributeDonations(true);
    console.log(`Completed distribution process for vetted beneficiaries at ${new Date()}`);
    console.log(result);
    console.log();
  }, null, true, 'Africa/Nairobi');

  try {
    job.start();
  }
  catch(e) {
    console.error(e);
    job.start();
  }
}
import { App } from '../core';
import { CronJob } from 'cron';

export function runDistributionWorker(app: App, intervalMinutes: number) {
  const job = new CronJob(`* ${intervalMinutes} * * * * *`, async () => {
    const result = await app.donationDistributions.distributeDonations();
    console.log(`Completed distribution process at ${new Date()}`);
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
import { App } from '../core';
import { CronJob } from 'cron';

export function runDistributionReportingWorker(app: App, interval: string) {
  const job = new CronJob(interval, async () => {
    console.log(`Starting distribution report generation process at ${new Date()}...`);
    const result = await app.transactions.generateDistributionReportPerDonor();
    console.log(`Completed distribution report generation process at ${new Date()}`);
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
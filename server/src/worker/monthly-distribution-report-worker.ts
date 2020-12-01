import { App } from '../core';
import { CronJob } from 'cron';

export function runMonthlyDistributionReportingWorker(app: App, interval: string) {
  const job = new CronJob(interval, async () => {
    console.log(`Starting process of sending monthly distribution reports at ${new Date()}...`);
    const result = await app.distributionReports.sendMonthlyDistributionReportsToDonors();
    console.log(`Completed process of sending monthly distribution reports at ${new Date()}`);
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
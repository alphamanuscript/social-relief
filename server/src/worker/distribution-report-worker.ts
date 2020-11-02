import { App } from '../core';
import { CronJob } from 'cron';

export function runDistributionReportingWorker(app: App, interval: string) {
  const job = new CronJob(interval, async () => {
    console.log(`Starting process of sending distribution reports at ${new Date()}...`);
    const result = await app.distributionReports.sendDistributionReportsToDonors();
    console.log(`Completed process of sending distribution reports at ${new Date()}`);
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
import { App } from '../core';
import { CronJob } from 'cron';

export function runDailyDistributionReportingWorker(app: App, interval: string) {
  const job = new CronJob(interval, async () => {
    console.log(`Starting process of sending daily distribution reports at ${new Date()}...`);
    const result = await app.distributionReports.sendDailyDistributionReportsToDonors();
    console.log(`Completed process of sending daily distribution reports at ${new Date()}`);
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
import { loadAppConfigFromEnv, bootstrap } from './core';
import { runDistributionWorker, runVettedBeneficiaryDistributionWorker, runStatsComputationWorker, runDailyDistributionReportingWorker, runMonthlyDistributionReportingWorker } from './worker';

const MILLISECONDS_PER_MINUTE = 60 * 1000;

export async function startWorker() {
  try {
    const config = loadAppConfigFromEnv(process.env);
    const app = await bootstrap(config);
    // runDistributionWorker(app, config.distributionInterval);
    // runVettedBeneficiaryDistributionWorker(app, config.vettedDistributionInterval);
    // runStatsComputationWorker(app, config.statsComputationInterval * MILLISECONDS_PER_MINUTE);
    // runDailyDistributionReportingWorker(app, config.dailyDistributionReportingInterval);
    runMonthlyDistributionReportingWorker(app, config.monthlyDistributionReportingInterval);
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
}

startWorker();

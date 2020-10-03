import { loadAppConfigFromEnv, bootstrap } from './core';
import { runDistributionWorker, runVettedBeneficiaryDistributionWorker, runStatsComputationWorker } from './worker';

const MILLISECONDS_PER_MINUTE = 60 * 1000;

export async function startWorker() {
  try {
    const config = loadAppConfigFromEnv(process.env);
    const app = await bootstrap(config);
    runDistributionWorker(app, config.distributionInterval * MILLISECONDS_PER_MINUTE);
    runVettedBeneficiaryDistributionWorker(app, config.vettedDistributionInterval * MILLISECONDS_PER_MINUTE);
    runStatsComputationWorker(app, config.statsComputationInterval * MILLISECONDS_PER_MINUTE);
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
}

startWorker();

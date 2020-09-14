import { loadAppConfigFromEnv, bootstrap } from './core';
import { runBeneficiaryManagementCLI } from './cli';

export async function startCLI() {
  try {
    const config = loadAppConfigFromEnv(process.env);
    const app = await bootstrap(config);
    runBeneficiaryManagementCLI(app);
  }
  catch(e) {
    console.error(e);
    process.exit(1);
  }
}

startCLI();
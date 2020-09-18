import { loadAppConfigFromEnv, bootstrap, App } from './core';
import { runAdminCLI } from './admin-cli/admin-cli';

async function startCLI() {
  try {
    const config = loadAppConfigFromEnv(process.env);
    const app = await bootstrap(config);
    runAdminCLI(app);
  }
  catch(e) {
    console.error(e);
    process.exit(1);
  }
}

startCLI();
import { loadAppConfigFromEnv, bootstrap } from './core';
import { createServer } from './server';
import { mountRestApi } from './rest';
import { mountAtWebhooks, mountManualPaymentWebhooks } from './webhooks';

async function startServer() {
  try {
    const config = loadAppConfigFromEnv(process.env);
    const app = await bootstrap(config);
    const server = createServer(app);
    mountRestApi(server, '/api');
    mountAtWebhooks(server, config.atWebhooksRoot);
    mountManualPaymentWebhooks(server, config.manualPayWebhooksRoot);

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    })
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
}

startServer();

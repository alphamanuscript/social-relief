import { AppConfig, bootstrap } from './core';
import { createServer } from './server';
import { mountRestApi } from './rest';
import { mountAtWebhooks } from './webhooks';

const config: AppConfig = {
  dbName: process.env.DB_NAME || 'crowdrelief',
  dbUri: process.env.DB_URL || 'mongodb://localhost:27017/crowdrelief',
  port: (process.env.PORT && Number(process.env.PORT)) || 3000,
  atApiKey: process.env.AT_API_KEY || '',
  atUsername: process.env.AT_USERNAME || 'sandbox',
  atPaymentsProductName: process.env.AT_PAYMENTS_PRODUCT_NAME || 'TestCrowdRelief',
  atPaymentsProviderChannel: process.env.AT_PAYMENTS_PROVIDER_CHANNEL || '50000',
  atWebhooksRoot: '/at-webhooks'
};

async function startApp() {
  try {
    const app = await bootstrap(config);
    const server = createServer(app);
    mountRestApi(server, '/api');
    mountAtWebhooks(server, config.atWebhooksRoot);

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    })
  }
  catch (e) {
    console.error(e);
    process.exit(1);
  }
}

startApp();

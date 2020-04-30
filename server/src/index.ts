import { AppConfig, bootstrap } from './core';
import { createServer } from './server';
import { mountRestApi } from './rest';

const config: AppConfig = {
  dbName: process.env.DB_NAME || 'crowdrelief',
  dbUri: process.env.DB_URL || 'mongodb://localhost:27017/crowdrelief',
  port: (process.env.PORT && Number(process.env.PORT)) || 3000
};

async function startApp() {
  try {
    const app = await bootstrap(config);
    const server = createServer(app);
    mountRestApi(server, '/api');

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

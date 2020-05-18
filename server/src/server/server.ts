import * as express from 'express';
import * as cors from 'cors';
import { App } from '../core';
import { injectApp } from './middleware';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

export function createServer(app: App) {
  const server = express();
  server.use(helmet());
  server.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 20 })); // Limit each IP to 20 requests per minute
  server.use(express.json());
  server.use(cors());
  server.use(injectApp(app));
  return server;
}

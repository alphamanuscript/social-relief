import * as express from 'express';
import * as cors from 'cors';
import { App } from '../core';
import { injectApp } from './middleware';
import * as helmet from 'helmet';

export function createServer(app: App) {
  const server = express();
  server.use(helmet());
  server.use(express.json());
  server.use(cors());
  server.use(injectApp(app));
  return server;
}

import * as express from 'express';
import * as cors from 'cors';
import { App } from '../core';
import { injectApp } from './middleware';

export function createServer(app: App) {
  const server = express();
  server.use(express.json());
  server.use(cors());
  server.use(injectApp(app));
  return server;
}
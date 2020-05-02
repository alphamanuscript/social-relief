import { Express } from 'express'
import { atRoutes } from './at';

export function mountAtWebhooks(server: Express, rootPath: string) {
  server.use(rootPath, atRoutes);
}

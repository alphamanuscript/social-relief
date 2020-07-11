import { Express } from 'express'
import { atRoutes } from './at';
import { manualPayRoutes } from './manualpay';
import { flutterwaveRoutes } from './flutterwave';

export function mountAtWebhooks(server: Express, rootPath: string) {
  server.use(rootPath, atRoutes);
}

export function mountManualPaymentWebhooks(server: Express, rootPath: string) {
  server.use(rootPath, manualPayRoutes);
}

export function mountFlutterwaveWebhooks(server: Express, rootPath: string) {
  server.use(rootPath, flutterwaveRoutes);
}

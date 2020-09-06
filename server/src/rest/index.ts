import { Express, Router } from 'express';
import { messages } from '../core';
import { errorHandler, error404Handler } from './middleware';
import { root, users, donations, transactions, invitations, refunds, stats, anonymous } from './routes';

export function mountRestApi(server: Express, apiRoot: string) {
  const router = Router();

  router.use('/users', users);
  router.use('/anonymous', anonymous);
  router.use('/donations', donations);
  router.use('/transactions', transactions);
  router.use('/invitations', invitations);
  router.use('/refunds', refunds);
  router.use('/stats', stats);
  router.use('/', root);

  router.use(errorHandler());
  router.use(error404Handler(messages.ERROR_ROUTE_NOT_FOUND));

  server.use(apiRoot, router);
}
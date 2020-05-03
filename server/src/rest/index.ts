import { Express, Router } from 'express';
import { messages } from '../core';
import { errorHandler, error404Handler } from './middleware';
import { root } from './root-route';
import { users } from './users-route';
import { donations } from './donations-route';
import { transactions } from './transactions-route';

export function mountRestApi(server: Express, apiRoot: string) {
  const router = Router();

  router.use('/users', users);
  router.use('/donations', donations);
  router.use('/transactions', transactions);
  router.use('/', root);

  router.use(errorHandler());
  router.use(error404Handler(messages.ERROR_ROUTE_NOT_FOUND));

  server.use(apiRoot, router);
}
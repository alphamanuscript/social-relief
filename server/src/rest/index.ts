import { Express, Router } from 'express';
import { messages } from '../core';
import { errorHandler, error404Handler } from './middleware';
import { users } from './users-route';
import { root } from './root-route';

export function mountRestApi(server: Express, apiRoot: string) {
  const router = Router();

  router.use('/users', users);
  router.use('/', root);

  router.use(errorHandler());
  router.use(error404Handler(messages.ERROR_ROUTE_NOT_FOUND));

  server.use(apiRoot, router);
}
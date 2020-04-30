import { App } from '../core';
import { AppRequest } from './types';
import { RequestHandler } from 'express';

export function injectApp(app: App):  RequestHandler {
  return (req: AppRequest, res, next) => {
    req.core = app;
    next();
  }
}

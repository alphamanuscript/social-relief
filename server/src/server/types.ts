import { Request, Response } from 'express';
import { App } from '../core';
import { User } from '../core/user';

export interface AppRequest extends Request {
  core: App,
  user: User,
  accessToken: string
};

export interface AppResponse extends Response {}

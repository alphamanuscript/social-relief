import { Router } from 'express';
import { statusCodes } from '../../server';
import { wrapResponse } from '../middleware';

export const anonymousUsers = Router();

anonymousUsers.post('/create', wrapResponse(
  req => req.core.anonymousUsers.create(req.body),
  statusCodes.STATUS_CREATED));

anonymousUsers.post('/initiate', wrapResponse(
  req => req.core.anonymousUsers.donate(req.body)));


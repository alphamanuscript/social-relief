import { Router } from 'express';
import { statusCodes } from '../../server';
import { wrapResponse, requireAuth } from '../middleware';
import { getAccessToken } from '../util';

export const users = Router();

users.post('/', wrapResponse(
  req => req.core.users.create(req.body),
  statusCodes.STATUS_CREATED));

users.post('/login', wrapResponse(
  req => req.core.users.login(req.body)));

users.post('/logout', wrapResponse(
  req => req.core.users.logout(getAccessToken(req)),
  statusCodes.STATUS_NO_CONTENT))

users.post('/logout-all', requireAuth(), wrapResponse(
  req => req.core.users.logoutAll(req.user._id)));

users.get('/me', requireAuth(), wrapResponse(
  req => Promise.resolve(req.user)));

users.post('/beneficiaries', requireAuth(), wrapResponse(
  req => req.core.users.nominateBeneficiary(req.body)));

import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const donations = Router();

donations.post('/initiate', requireAuth(), wrapResponse(
  req => req.core.users.initiateDonation(req.user._id, req.body)));

donations.post('/anonymous/initiate', wrapResponse(
  req => req.core.users.donateAnonymously(req.body)));
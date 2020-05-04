import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const donations = Router();
donations.use(requireAuth());

donations.post('/initiate', wrapResponse(
  req => req.core.users.initiateDonation(req.user._id, req.body)));
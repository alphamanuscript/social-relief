import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const refunds = Router();
refunds.use(requireAuth());

refunds.post('/initiate', wrapResponse(
  req => req.core.users.initiateRefund(req.user._id)));
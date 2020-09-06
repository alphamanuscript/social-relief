import { Router } from 'express';
import { wrapResponse } from '../middleware';

export const anonymous = Router();

anonymous.post('/donate', wrapResponse(
  req => req.core.users.donateAnonymously(req.body)));


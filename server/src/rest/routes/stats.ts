import { Router } from 'express';
import { wrapResponse } from '../middleware';

export const stats = Router();

stats.get('/', wrapResponse(
  req => req.core.stats.get()));
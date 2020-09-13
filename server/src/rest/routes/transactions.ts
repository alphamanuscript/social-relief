import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const transactions = Router();

// transactions.use(requireAuth());

transactions.get('/', requireAuth(), wrapResponse(
  req => req.core.transactions.getAllByUser(req.user._id)));

transactions.get('/:id', requireAuth(), wrapResponse(
  req => req.core.transactions.checkUserTransactionStatus(req.user._id, req.params.id)));

transactions.get('/anonymous/:userId', wrapResponse(
  req => req.core.transactions.getAllByUser(req.params.userId)));

transactions.get('/:id/anonymous/:userId', wrapResponse(
  req => req.core.transactions.checkUserTransactionStatus(req.params.userId, req.params.id)));

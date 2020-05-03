import { Router } from 'express';
import { wrapResponse, requireAuth } from './middleware';

export const transactions = Router();

transactions.use(requireAuth());

transactions.get('/', wrapResponse(
  req => req.core.transactions.getAllByUser(req.user._id)));

transactions.get('/:id', wrapResponse(
  req => req.core.transactions.checkUserTransactionStatus(req.user._id, req.params.id)));

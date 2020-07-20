import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const invitations = Router();

invitations.use(requireAuth());

invitations.get('/', wrapResponse(
  req => req.core.invitations.getAllByUser(req.user._id, req.user.phone)));

invitations.get('/:id', wrapResponse(
  req => req.core.invitations.get(req.params.id)));
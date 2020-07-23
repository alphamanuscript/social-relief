import { Router } from 'express';
import { wrapResponse, requireAuth } from '../middleware';

export const invitations = Router();

invitations.get('/', requireAuth(), wrapResponse(
  req => req.core.invitations.getAllByUser(req.user._id, req.user.phone)));

invitations.get('/:id', wrapResponse(
  req => req.core.invitations.get(req.params.id)));

invitations.put('/:id', wrapResponse(
  req => req.body.accept === true ? req.core.invitations.accept(req.params.id) : req.core.invitations.reject(req.params.id)));
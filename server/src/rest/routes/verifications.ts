import { Router } from 'express';
import { wrapResponse } from '../middleware';

export const verifications = Router();

verifications.put('/phone/:id', wrapResponse(
  req => req.core.phoneVerification.confirmVerificationCode(req.params.id, req.body.code)));

verifications.get('/phone/:id', wrapResponse(
  req => req.core.phoneVerification.getById(req.params.id)));
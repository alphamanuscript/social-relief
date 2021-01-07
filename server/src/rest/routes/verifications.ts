import { Router } from 'express';
import { wrapResponse } from '../middleware';

export const verifications = Router();

verifications.put('/phone/', wrapResponse(
  req => req.core.phoneVerification.confirmVerificationCode(req.body.id, req.body.code)));

verifications.get('/phone/:id', wrapResponse(
  req => req.core.phoneVerification.getById(req.params.id)));
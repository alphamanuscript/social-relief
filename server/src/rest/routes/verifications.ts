import { Router } from 'express';
import { wrapResponse } from '../middleware';

export const verifications = Router();

verifications.put('/phone/:id', wrapResponse(
  req => req.core.phoneVerification.confirmVerificationCode(req.params.id, req.body.code)));

verifications.put('/phone/resend/code/:id', wrapResponse(
  req => req.core.phoneVerification.resendVerificationCode(req.params.id)));

verifications.get('/phone/:id', wrapResponse(
  req => req.core.phoneVerification.getById(req.params.id)));

verifications.post('/phone', wrapResponse(
  req => req.core.phoneVerification.create(req.body.phone)));
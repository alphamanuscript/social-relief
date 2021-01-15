import { createValidationError } from '../error';
import * as schemas from './validation-schemas';

export const validatesCreate = (phone: string) => {
  const { error } = schemas.createInputSchema.validate({ phone });
  if (error) throw createValidationError(error.details[0].message);
  if (phone[0] === '0') createValidationError('Phone number cannot start with 0'); 
}

export const validatesConfirmVerificationCode = ({ recordId, code}: { recordId: string, code: number}) => {
  const { error } = schemas.confirmVerificationCodeInputSchema.validate({ recordId, code });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesResendVerificationCode = (recordId: string) => {
  const { error } = schemas.resendVerificationCodeInputSchema.validate({ recordId });
  if (error) throw createValidationError(error.details[0].message);
}
import { createValidationError } from '../error';
import * as schemas from './validation-schemas';

export const validatesCreate = (phone: string) => {
  const { error } = schemas.createInputSchema.validate({phone});
  if (error) throw createValidationError(error.details[0].message);
  if (phone[0] === '0') createValidationError('Phone number cannot start with 0'); 
}
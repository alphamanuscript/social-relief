import * as schemas from './validation-schemas';
import { createValidationError } from '../error';

export const validatesGetAllByUser = ({ userId, userPhone }: { userId: string; userPhone: string}) => {
  const { error } = schemas.getAllByUserInputSchema.validate({ userId, userPhone });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGet = (invitationId: string) => {
  const { error } = schemas.getInputSchema.validate({ invitationId });
  if (error) throw createValidationError(error.details[0].message);
}
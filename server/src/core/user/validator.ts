import { UserCreateArgs, UserNominateBeneficiaryArgs, UserLoginArgs } from './types'
import { createValidationError } from '../error';
import { userCreateSchema, userNominateBeneficiary, userLoginSchema } from './schema';

export const validatesCreate = (args: UserCreateArgs) => {
  const { error } = userCreateSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesLogin = (args: UserLoginArgs) => {
  const { error } = userCreateSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesNominateBeneficiary = (args: UserNominateBeneficiaryArgs) => {
  const { error } = userNominateBeneficiary.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}
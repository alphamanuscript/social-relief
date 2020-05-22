import { UserCreateArgs, UserNominateBeneficiaryArgs, UserLoginArgs } from './types'
import { createValidationError } from '../error';
import { Schema } from '.';

export const validatesCreate = (args: UserCreateArgs) => {
  const { error } = Schema.userCreateSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesLogin = (args: UserLoginArgs) => {
  const { error } = Schema.userLoginSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesNominateBeneficiary = (args: UserNominateBeneficiaryArgs) => {
  const { error } = Schema.userNominateBeneficiarySchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGetAllBeneficiariesByUser = (userId: string) => {
  const { error } = Schema.userGetAllBeneficiariesSchema.validate(userId);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGetByToken = (tokenId: string) => {
  const { error } = Schema.userGetByToken.validate({ tokenId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesLogout = (tokenId: string) => {
  const { error } = Schema.userLogout.validate({ tokenId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesLogoutAll = (userId: string) => {
  const { error } = Schema.userLogoutAll.validate({ userId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesInitiateDonation = (userId: string, amount: number) => {
  // The convert: false object is very important when dealing with number validation
  // and ensures that input is not converted from one type to another type during validation
  const { error } = Schema.userInitiateDonation.validate({ userId, amount }, {convert: false}); 
  if (error) throw createValidationError(error.details[0].message);
}


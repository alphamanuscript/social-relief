import { UserCreateArgs, UserNominateArgs, UserLoginArgs, UserActivateArgs, UserPutArgs, UserDonateAnonymouslyArgs, UserAddVettedBeneficiaryArgs } from './types'
import { createValidationError } from '../error';
import * as schemas from './validation-schemas';
import { makeValidatorFromJoiSchema } from '../util';

export const validatesCreate = (args: UserCreateArgs) => {
  const { error } = schemas.createInputSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
  if (args.phone[0] === '0') createValidationError('Phone number cannot start with 0'); 
}

export const validateDonateAnonymously = (args: UserDonateAnonymouslyArgs) => {
  const { error } = schemas.donateAnonymouslyInputSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
  if (args.phone[0] === '0') createValidationError('Phone number cannot start with 0'); 
}

export const validatesLogin = (args: UserLoginArgs) => {
  const { error } = schemas.loginInputSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesNominate = (args: UserNominateArgs) => {
  const { error } = schemas.nominateInputSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
  if (args.role && ['beneficiary', 'middleman'].includes(args.role) === false) 
    throw createValidationError("Role must be either 'beneficiary' or 'middleman'");
  if (args.phone[0] === '0') createValidationError('Phone number cannot start with 0'); 
}

export const validatesAddVettedBeneficiary = (args: UserAddVettedBeneficiaryArgs) => {
  const { error } = schemas.addVettedBeneficiarySchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
  if (args.phone[0] === '0') createValidationError('Phone number cannot start with 0');
}

export const validatesActivate = (args: UserActivateArgs) => {
  const { error } = schemas.activateInputSchema.validate(args);
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGetAllBeneficiariesByUser = (userId: string) => {
  const { error } = schemas.getAllBeneficiariesInputSchema.validate({ userId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGetByToken = (tokenId: string) => {
  const { error } = schemas.getByTokenInputSchema.validate({ tokenId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesVerifyVettedBeneficiaryByPhone = (phone: string) => {
  const { error } = schemas.verifyVettedBeneficiaryByPhoneInputSchema.validate({ phone });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGetByPhone = validatesVerifyVettedBeneficiaryByPhone;

export const validatesUpgradeUnvettedBeneficiaryByPhone = validatesGetByPhone;

export const validatesLogout = (tokenId: string) => {
  const { error } = schemas.logoutInputSchema.validate({ tokenId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesLogoutAll = (userId: string) => {
  const { error } = schemas.logoutAllInputSchema.validate({ userId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesInitiateDonation = ({ userId, amount } : { userId: string; amount: number }) => {
  // The convert: false object is very important when dealing with number validation
  // and ensures that input is not converted from one type to another type during validation
  const { error } = schemas.initiateDonationInputSchema.validate({ userId, amount }, {convert: false}); 
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesGetNew = validatesLogoutAll;

export const validatesUpgradeUnvettedBeneficiaryById = validatesGetNew;

export const validatesVerifyVettedBeneficiaryById = validatesGetNew;

export const validatesGetAnonymous = validatesGetNew;

export const validatesVerifyBeneficiary = validatesGetAnonymous;

export const validatesPut = ({ userId, args } : { userId: string, args: UserPutArgs}) => {
  const { name, email, password } = args;
  const { error } = schemas.putInputSchema.validate({ userId, name, email, password });
  if (error) throw createValidationError(error.details[0].message);
}


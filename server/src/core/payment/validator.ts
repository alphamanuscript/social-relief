import {  } from './types'
import { createValidationError } from '../error';
import * as schemas from './validation-schemas';
import * as userValidators from '../user/validator';
import { hasOnlyAllowedKeys } from '../util'

export const validatesGetAllByUser = userValidators.validatesGetAllBeneficiariesByUser;

export const validatesInitiateDonation = userValidators.validatesInitiateDonation;

export const validatesSendDonation = ({ from, to, amountArg }: { from: string; to: string; amountArg: any}) => {
  if (!hasOnlyAllowedKeys(amountArg, ['amount'])) throw createValidationError(); 
  const { error } = schemas.sendDonationInputSchema.validate({ from, to, amount: amountArg.amount }, { convert: false });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesCheckUserTransactionStatus = ({ userId, transactionId }: { userId: string; transactionId: string}) => {
  const { error } = schemas.checkUserTransactionStatusInputSchema.validate({ userId, transactionId });
  if (error) throw createValidationError(error.details[0].message);
}

export const validatesHandleProviderNotification = (payload: any) => {
  const { error } = schemas.handleProviderNotificationInputSchema.validate(payload);
  if (error) throw createValidationError(error.details[0].message);
}
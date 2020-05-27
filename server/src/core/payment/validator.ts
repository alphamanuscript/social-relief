import {  } from './types'
import { createValidationError } from '../error';
import * as schemas from './validation-schemas';
import * as userValidators from '../user/validator';

export const validatesGetAllByUser = userValidators.validatesGetAllBeneficiariesByUser;

export const validatesInitiateDonation = userValidators.validatesInitiateDonation;

export const validatesSendDonation = ({ from, to, amount }: { from: string; to: string; amount: number}) => {
  const { error } = schemas.transactionSendDonation.validate({ from, to, amount });
  if (error) throw createValidationError(error.details[0].message);
}
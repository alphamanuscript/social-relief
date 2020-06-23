import * as joi from '@hapi/joi';
import { phoneValidationSchema, passwordValidationSchema, googleIdTokenValidationSchema } from '../util/validation-util';

const userCreateAndLoginSchema = joi.alternatives().try(
  joi.object().keys({ phone: phoneValidationSchema, password: passwordValidationSchema }),
  joi.object().keys({ phone: phoneValidationSchema, googleIdToken: googleIdTokenValidationSchema }),
  joi.object().keys({ googleIdToken: googleIdTokenValidationSchema })
);

const userTokenIdSchema = joi.object().keys({
  tokenId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{128}$/)
    .messages({
      'string.required': `tokenId is required`,
      'string.base': 'Invalid type, tokenId must be a string',
      'string.empty': `Please enter tokenId`,
      'string.pattern.base': `Invalid tokenId. Must contain hexadecimals only and be 128 characters long`
    }),
})

const userIdSchema = joi.object().keys({
  userId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `userId is required`,
      'string.base': 'Invalid type, userId must be a string',
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 32 characters long`
    }),
})

export const createInputSchema = userCreateAndLoginSchema; 

export const loginInputSchema = userCreateAndLoginSchema;

export const nominateBeneficiaryInputSchema = joi.object().keys({
  phone: joi.string()
    .required()
    .pattern(/^2547\d{8}$/) // Starts with 2547 and ends with 8 digits
    .messages({
      'any.required': 'Phone is required',
      'string.base': 'Invalid type, phone must be a string',
      'string.empty': 'Please enter your phone number',
      'string.pattern.base': 'Invalid phone number. Must start with 2547 and be 12 digit long'
    }),
  nominator: joi.string()
    .required()
    .messages({
      'any.required': `Nominator id is required`,
      'string.base': 'Invalid type, nominator must be a string',
      'string.empty': `Nominator id is required`,
    }),
});

export const nominateMiddlemanInputSchema = nominateBeneficiaryInputSchema;

export const getAllBeneficiariesInputSchema = userIdSchema;

export const logoutInputSchema = userTokenIdSchema;

export const getByTokenInputSchema = userTokenIdSchema;

export const logoutAllInputSchema = userIdSchema;

export const initiateDonationInputSchema = joi.object().keys({
  userId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `userId is required`,
      'string.base': 'Invalid type, userId must be a string',
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 16 characters long`
    }),
  amount: joi.number()
    .required()
    .min(100)
    .messages({
      'any.required': `amount is required`,
      'number.base': 'Invalid type, amount must be a number',
      'number.min': `amount must be 100 or more`,
    })
});
import * as joi from '@hapi/joi';
import { phoneValidationSchema } from '../util/validation-util';

const recordIdSchema = joi.string()
  .required()
  .pattern(/^[a-fA-F0-9]{32}$/)
  .messages({
    'any.required': `recordId is required`,
    'string.base': 'Invalid type, recordId must be a string',
    'string.empty': `Please enter recordId`,
    'string.pattern.base': `Invalid recordId. Must contain hexadecimals only and be 32 characters long`
});

const codeSchema = joi.number()
  .required()
  .min(100000)
  .max(999999)
  .messages({
    'any.required': `Code is required`,
    'number.base': 'Invalid type, code must be a number',
    'number.min': `Code must be between 100000 and 999999, inclusive`,
  })


export const createInputSchema = joi.object().keys({
  phone: phoneValidationSchema,
});

export const confirmVerificationCodeInputSchema = joi.object().keys({
  recordId: recordIdSchema,

});

export const resendVerificationCodeInputSchema = joi.object().keys({
  recordId: recordIdSchema
});
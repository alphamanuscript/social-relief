import * as joi from '@hapi/joi';
import { idValidationSchema, phoneValidationSchema } from '../util/validation-util';

export const getAllByUserInputSchema = joi.object().keys({
  userId: idValidationSchema,
  userPhone: phoneValidationSchema
});

export const getInputSchema = joi.object().keys({ 
  invitationId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `invitationId is required`,
      'string.base': `Invalid type, invitationId must be a string`,
      'string.empty': `Please enter invitationId`,
      'string.pattern.base': `Invalid invitationId. Must contain hexadecimals only and be 32 characters long`
    }), 
});
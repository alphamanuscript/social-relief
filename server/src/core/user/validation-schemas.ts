import * as joi from '@hapi/joi';
import { phoneValidationSchema, passwordValidationSchema, googleIdTokenValidationSchema, emailValidationSchema } from '../util/validation-util';

const emailSchema = joi.string()
  .pattern(/\S+@\S+\.\S+/) // Simplest pattern (anything@anything.anything) of email validation. Should be updated with a more rigorous, thorough pattern
  .messages({
    'string.base': 'Invalid type, email must be a string',
    'string.pattern.base': 'Invalid email.'
  });

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

export const createInputSchema = joi.alternatives().try(
  joi.object().keys({
    phone: phoneValidationSchema,
    password: passwordValidationSchema,
    name: joi.string().required(),
    email: emailSchema
  }),
  joi.object().keys({ phone: phoneValidationSchema, googleIdToken: googleIdTokenValidationSchema }),
);; 

export const loginInputSchema = joi.alternatives().try(
  joi.object().keys({ phone: phoneValidationSchema, password: passwordValidationSchema }),
  joi.object().keys({ phone: phoneValidationSchema, googleIdToken: googleIdTokenValidationSchema }),
  joi.object().keys({ googleIdToken: googleIdTokenValidationSchema })
);;

export const nominateInputSchema = joi.object().keys({
  phone: joi.string()
    .required()
    .pattern(/^254\d{9}$/) // Starts with 254 and ends with 9 digits
    .messages({
      'any.required': 'Phone is required',
      'string.base': 'Invalid type, phone must be a string',
      'string.empty': 'Please enter phone number',
      'string.pattern.base': 'Invalid phone number. Must start with 254 and be 12 digit long'
    }),
  name: joi.string()
    .required()
    .messages({
      'any.required': 'Name is required',
      'string.empty': 'Name is required'
    }),
  email: emailSchema,
  nominatorId: joi.string()
    .required()
    .messages({
      'any.required': `Nominator id is required`,
      'string.base': 'Invalid type, nominator id must be a string',
      'string.empty': `Nominator id is required`,
    }),
  nominatorName: joi.string()
    .required()
    .messages({
      'any.required': `Nominator name is required`,
      'string.base': 'Invalid type, nominator name must be a string',
      'string.empty': `Nominator name is required`,
    }),
  role: joi.string()
    .required()
    .messages({
      'any.required': `Role is required`,
      'string.base': 'Invalid type, role must be a string',
      'string.empty': `Role is required`,
    })
});

export const activateInputSchema = joi.object().keys({
  invitationId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `invitationId is required`,
      'string.base': `Invalid type, invitationId  must be a string`,
      'string.empty': `Please enter invitationId`,
      'string.pattern.base': `Invalid invitationId. Must contain hexadecimals only and be 32 characters long`
    }),
});

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

export const putInputSchema = joi.object().keys({
  userId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `userId is required`,
      'string.base': 'Invalid type, userId must be a string',
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 16 characters long`
    }),
  name: joi.string()
    .required()
    .messages({
      'any.required': 'name is required',
      'string.empty': 'name is required'
    }),
  email: emailValidationSchema,
  password: passwordValidationSchema
})
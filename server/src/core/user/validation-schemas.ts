import * as joi from '@hapi/joi';

const userCreateAndLoginSchema = joi.object().keys({
  phone: joi.string()
    .required()
    .pattern(/^2547\d{8}$/) // Starts with 2547 and ends with 8 digits
    .messages({
      'any.required': 'Phone is required',
      'string.base': 'Invalid type, phone must be a string',
      'string.empty': 'Please enter your phone number',
      'string.pattern.base': 'Invalid phone number. Must start with 2547 and be 12 digit long'
    }),
  password: joi.string()
    .required()
    .pattern(/^.{8,18}$/)
    .messages({
      'any.required': 'Password is required',
      'string.base': 'Invalid type, password must be a string',
      'string.empty': 'Please enter your password',
      'string.pattern.base': 'Invalid password. Must range between 8 and 18 characters'
    })
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
    .pattern(/^2547\d{8}$/)
    .messages({
      'any.required': `Nominator is required`,
      'string.base': 'Invalid type, nominator must be a string',
      'string.empty': `Please enter nominator's phone number`,
      'string.pattern.base': `Invalid nominator's phone number. Must start with 2547 and be 12 digit long`
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
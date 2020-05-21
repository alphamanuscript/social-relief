import * as joi from '@hapi/joi';

const userCreateAndLoginSchema = joi.object().keys({
  phone: joi.string()
    .required()
    .pattern(new RegExp(/^2547\d{8}$/)) // Starts with 2547 and ends with 8 digits
    .messages({
      'any.required': 'Phone is required',
      'string.base': 'Invalid type, phone must be a string',
      'string.empty': 'Please enter your phone number',
      'string.pattern.base': 'Invalid phone number. Must start with 2547 and be 12 digit long'
    }),
  password: joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])(?=.{8,18}$)[a-zA-Z][a-zA-Z\d]*[~!@#$%^&*?<>]*$/))
    .messages({
      'any.required': 'Password is required',
      'string.base': 'Invalid type, password must be a string',
      'string.empty': 'Please enter your password',
      'string.pattern.base': 'Invalid password. Must range between 8 and 18 characters and have at least one uppercase, lowercase, digit, and special character'
    })
}); 

const userTokenIdSchema = joi.object().keys({
  tokenId: joi.string()
    .required()
    .pattern(new RegExp(/^[a-fA-F0-9]{64}$/))
    .messages({
      'any.required': `tokenId is required`,
      'string.base': 'Invalid type, tokenId must be a string',
      'string.empty': `Please enter tokenId`,
      'string.pattern.base': `Invalid tokenId. Must contain hexadecimals only and be 64 characters long`
    }),
})

const userIdSchema = joi.object().keys({
  userId: joi.string()
    .required()
    .pattern(new RegExp(/^[a-fA-F0-9]{16}$/))
    .messages({
      'any.required': `userId is required`,
      'string.base': 'Invalid type, userId must be a string',
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 16 characters long`
    }),
})

export const userCreateSchema = userCreateAndLoginSchema; 

export const userLoginSchema = userCreateAndLoginSchema;

export const userNominateBeneficiarySchema = joi.object().keys({
  phone: joi.string()
    .required()
    .pattern(new RegExp(/^2547\d{8}$/)) // Starts with 2547 and ends with 8 digits
    .messages({
      'any.required': 'Phone is required',
      'string.base': 'Invalid type, phone must be a string',
      'string.empty': 'Please enter your phone number',
      'string.pattern.base': 'Invalid phone number. Must start with 2547 and be 12 digit long'
    }),
  nominator: joi.string()
    .required()
    .pattern(new RegExp(/^2547\d{8}$/))
    .messages({
      'any.required': `Nominator is required`,
      'string.base': 'Invalid type, nominator must be a string',
      'string.empty': `Please enter nominator's phone number`,
      'string.pattern.base': `Invalid nominator's phone number. Must start with 2547 and be 12 digit long`
    }),
});

export const userGetAllBeneficiariesSchema = userIdSchema;

export const userLogout = userTokenIdSchema;

export const userGetByToken = userTokenIdSchema;

export const userLogoutAll = userIdSchema;
import * as joi from '@hapi/joi';

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
});

export const getAllByUserInputSchema = userIdSchema;

export const sendDonationInputSchema = joi.object().keys({
  from: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `'from' is required`,
      'string.base': `Invalid type, 'from' must be a string`,
      'string.empty': `Please enter 'from'`,
      'string.pattern.base': `Invalid 'from'. Must contain hexadecimals only and be 32 characters long`
    }),
  to: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `'to' is required`,
      'string.base': `Invalid type, 'to' must be a string`,
      'string.empty': `Please enter 'to'`,
      'string.pattern.base': `Invalid 'to'. Must contain hexadecimals only and be 32 characters long`
    }),
  amount: joi.number()
    .required()
    .max(2000)
    .messages({
      'any.required': `Amount is required`,
      'number.base': 'Invalid type, amount must be a number',
      'number.max': 'Amount cannot be more than 2000'
    })
});

export const checkUserTransactionStatusInputSchema = joi.object().keys({
  userId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `userId is required`,
      'string.base': `Invalid type, userId must be a string`,
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 32 characters long`
    }),
  transactionId: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `transactionId is required`,
      'string.base': `Invalid type, transactionId must be a string`,
      'string.empty': `Please enter transactionId`,
      'string.pattern.base': `Invalid transactionId. Must contain hexadecimals only and be 32 characters long`
    }),
})
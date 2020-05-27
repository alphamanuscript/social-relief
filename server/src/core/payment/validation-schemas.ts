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

export const transactionGetAllByUser = userIdSchema;

export const transactionSendDonation = joi.object().keys({
  from: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `userId is required`,
      'string.base': 'Invalid type, userId must be a string',
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 32 characters long`
    }),
  to: joi.string()
    .required()
    .pattern(/^[a-fA-F0-9]{32}$/)
    .messages({
      'any.required': `userId is required`,
      'string.base': 'Invalid type, userId must be a string',
      'string.empty': `Please enter userId`,
      'string.pattern.base': `Invalid userId. Must contain hexadecimals only and be 32 characters long`
    }),
  amount: joi.number()
    .required()
    .messages({
      'any.required': `amount is required`,
      'number.base': 'Invalid type, amount must be a number'
    })
})
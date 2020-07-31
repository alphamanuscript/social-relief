import * as joi from '@hapi/joi';
import { createValidationError } from '../error';

export function makeValidatorFromJoiSchema<TArgs = any>(schema: joi.Schema) {
  return (args: TArgs) => {
    const { error } = schema.validate(args);
    if (error) throw createValidationError(error.details[0].message);
  };
}

export const idValidationSchema = joi.string()
  .required()
  .pattern(/^[a-zA-Z0-9]+$/)
  .messages({
    'any.required': `id is required`,
    'string.base': 'Invalid type, id must be a string',
    'string.empty': `Please enter id`,
    'string.pattern.base': `Invalid id. Must contain alphanumeric only`
  });

export const validateId = makeValidatorFromJoiSchema(idValidationSchema);

export const phoneValidationSchema = joi.string()
  .required()
  .pattern(/^254\d{9}$/) // Starts with 254 and ends with 8 digits
  .messages({
    'any.required': 'Phone is required',
    'string.base': 'Invalid type, phone must be a string',
    'string.empty': 'Please enter your phone number',
    'string.pattern.base': 'Invalid phone number. Must start with 254 and be 12 digit long'
  });

export const passwordValidationSchema = joi.string()
  .required()
  .pattern(/^.{8,18}$/)
  .messages({
    'any.required': 'Password is required',
    'string.base': 'Invalid type, password must be a string',
    'string.empty': 'Please enter your password',
    'string.pattern.base': 'Invalid password. Must range between 8 and 18 characters'
});

export const googleIdTokenValidationSchema = joi.string()
  .required()
  .messages({
    'any.required': 'Google ID token is required',
    'string.base': 'Invalid type, Google ID token must be a string',
    'string.empty': 'Please enter your Google ID token',
});

export const emailValidationSchema = joi.string()
  .required()
  .email()
  .messages({
    'any.required': 'E-mail is required',
    'string.base': 'Invalid type, e-mail must be a string',
    'string.empty': 'Please enter e-mail',
    'string.email.base': 'Invalid e-mail'
  });

export const validateEmail = makeValidatorFromJoiSchema(emailValidationSchema);
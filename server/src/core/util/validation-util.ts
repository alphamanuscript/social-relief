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

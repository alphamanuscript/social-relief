import { UserCreateArgs } from './types'
import { throwValidationError } from '../error';
import * as joi from '@hapi/joi'

const userCreateSchema = joi.object().keys({
  phone: joi.string().required(),
  password: joi.string().required()
});

export const validatesCreate = (args: UserCreateArgs) => {
  const result = userCreateSchema.validate(args);
  if (result.error) {
    throwValidationError('Invalid phone or password');
  }
}
import * as joi from '@hapi/joi';
import { phoneValidationSchema } from '../util/validation-util';

export const createInputSchema = joi.object().keys({
  phone: phoneValidationSchema,
});
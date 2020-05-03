import { ERROR_LOGIN_FAILED, ERROR_INVALID_ACCESS_TOKEN, ERROR_RESOURCE_NOT_FOUND, ERROR_AT_API_ERROR, ERROR_BENEFICIARY_NOMINATION_FAILED } from './messages';

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
  }
}

export type ErrorCode = 
  // database error occurred when performing db operation
  'dbOpFailed'
  // database error occurred when connecting to db
  | 'dbConnectionFailed'
  | 'loginFailed'
  | 'invalidToken'
  | 'resourceNotFound'
  | 'uniquenessFailed'
  | 'paymentRequestFailed'
  | 'serverError'
  | 'atApiError'
  | 'serverError'
  | 'nominationFailed';

export function throwAppError(message: string, code: ErrorCode) {
  throw new AppError(message, code);
}

export function createAppError(message: string, code: ErrorCode): AppError {
  return new AppError(message, code);
}

export function createDbOpFailedError(message: string) {
  return createAppError(message, 'dbOpFailed');
}

export function createLoginError(message: string = ERROR_LOGIN_FAILED) {
  return createAppError(message, 'loginFailed');
}

export function createInvalidAccessTokenError(message: string = ERROR_INVALID_ACCESS_TOKEN) {
  return createAppError(message, 'invalidToken');
}

export function createResourceNotFoundError(message: string = ERROR_RESOURCE_NOT_FOUND) {
  return createAppError(message, 'resourceNotFound');
}

export function createUniquenessFailedError(message: string) {
  return createAppError(message, 'uniquenessFailed');
}

export function createPaymentRequestFailedError(message: string) {
  return createAppError(message, 'paymentRequestFailed');
}

export function createAtApiError(message: string = ERROR_AT_API_ERROR) {
  return createAppError(message, 'atApiError');
}
export function createBeneficiaryNominationFailedError (message: string = ERROR_BENEFICIARY_NOMINATION_FAILED) {
  return createAppError(message, 'nominationFailed');
}

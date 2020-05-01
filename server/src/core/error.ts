import { ERROR_LOGIN_FAILED, ERROR_INVALID_ACCESS_TOKEN, ERROR_RESOURCE_NOT_FOUND, ERROR_USER_CANNOT_BE_DONOR_AND_BENEFICIARY } from './messages';

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

export function createNominationFailedError(message: string = ERROR_USER_CANNOT_BE_DONOR_AND_BENEFICIARY) {
  return createAppError(message, 'nominationFailed');
}

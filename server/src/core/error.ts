import { ERROR_LOGIN_FAILED, ERROR_INVALID_ACCESS_TOKEN, ERROR_RESOURCE_NOT_FOUND } from './messages';

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
  | 'resourceNotFound';

export function throwAppError(message: string, code: ErrorCode) {
  throw new AppError(message, code);
}

export function throwDbOpFailedError(message: string) {
  throwAppError(message, 'dbOpFailed');
}

export function throwLoginError(message: string = ERROR_LOGIN_FAILED) {
  throwAppError(message, 'loginFailed');
}

export function throwInvalidAccessTokenError(message: string = ERROR_INVALID_ACCESS_TOKEN) {
  throwAppError(message, 'invalidToken');
}

export function throwResourceNotFoundError(message: string = ERROR_RESOURCE_NOT_FOUND) {
  throwAppError(message, 'resourceNotFound');
}
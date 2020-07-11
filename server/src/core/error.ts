import * as messages from './messages';
import { MongoError } from 'mongodb';

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
  }
}

export function isAppError(e: any) {
  return e instanceof AppError;
}

export function rethrowIfAppError(e: any) {
  if (isAppError(e)) throw e;
}

// MongoDB error codes
export const MONGO_ERROR_DUPLICATE_KEY = 11000;

/**
 * Checks whether the error is a MongoDB duplicate key error
 * If a key is provided, then it also checks whether that was the key
 * that triggered the duplicate error.
 * @param error
 * @param key
 */
export function isMongoDuplicateKeyError(error: MongoError, key?: any): boolean {
  if (error.code !== MONGO_ERROR_DUPLICATE_KEY) {
    return false;
  }
  
  if (typeof key === 'undefined') {
    return true;
  }

  return error.message.indexOf(key) > 0;
}

// Our error codes
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
  | 'b2cRequestFailed'
  | 'serverError'
  | 'atApiError'
  | 'manualPayApiError'
  | 'flutterwaveApiError'
  | 'serverError'
  | 'nominationFailed'
  | 'validationError'
  | 'batchQueueError'
  | 'systemLockLocked'
  | 'systemLockInvalidState'
  | 'messageDeliveryFailed';

export function createAppError(message: string, code: ErrorCode): AppError {
  return new AppError(message, code);
}

export function createDbOpFailedError(message: string) {
  return createAppError(message, 'dbOpFailed');
}

export function createLoginError(message: string = messages.ERROR_LOGIN_FAILED) {
  return createAppError(message, 'loginFailed');
}

export function createInvalidAccessTokenError(message: string = messages.ERROR_INVALID_ACCESS_TOKEN) {
  return createAppError(message, 'invalidToken');
}

export function createResourceNotFoundError(message: string = messages.ERROR_RESOURCE_NOT_FOUND) {
  return createAppError(message, 'resourceNotFound');
}

export function createUniquenessFailedError(message: string) {
  return createAppError(message, 'uniquenessFailed');
}

export function createPaymentRequestFailedError(message: string) {
  return createAppError(message, 'paymentRequestFailed');
}

export function createFundsToUserFailedError(message: string) {
  return createAppError(message, 'b2cRequestFailed');
}

export function createAtApiError(message: string = messages.ERROR_AT_API_ERROR) {
  return createAppError(message, 'atApiError');
}

export function createManualPayApiError(message: string) {
  return createAppError(message, 'manualPayApiError');
}

export function createFlutterwaveApiError(message: string) {
  return createAppError(message, 'flutterwaveApiError');
}

export function createBeneficiaryNominationFailedError(message: string = messages.ERROR_BENEFICIARY_NOMINATION_FAILED) {
  return createAppError(message, 'nominationFailed');
}

export function createMiddlemanNominationFailedError(message: string = messages.ERROR_MIDDLEMAN_NOMINATION_FAILED) {
  return createAppError(message, 'nominationFailed');
}

export function createSystemLockBusyError(message: string = messages.ERROR_CONFLICTING_OPERATION_IN_PROGRESS) {
  return createAppError(message, 'systemLockLocked');
}

export function createSystemLockInvalidStateError(message: string) {
  return createAppError(message, 'systemLockInvalidState');
}

export function createValidationError (message: string = messages.ERROR_INVALID_ARGUMENTS) {
  return createAppError(message, 'validationError');
}

export function createDbConnectionFailedError (message: string = messages.ERROR_DB_CONNECTION_FAILED) {
  return createAppError(message, 'dbConnectionFailed');
}

export function createMessageDeliveryFailedError(message: string) {
  return createAppError(message, 'messageDeliveryFailed');
}

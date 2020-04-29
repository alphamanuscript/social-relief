export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
  }
}

export type ErrorCode = 
  // database error occurred when performing db operation
  'dbOpFailed' |
  // database error occurred when connecting to db
  'dbConnectionFailed';

export function throwAppError(message: string, code: ErrorCode) {
  throw new AppError(message, code);
}

export function throwDbOpFailedError(message: string) {
  throwAppError(message, 'dbOpFailed');
}
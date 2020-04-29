import { messages, AppError } from '../core';
import { AppResponse, statusCodes, AppRequest } from '../server';

type ErrorArg = string | AppError;

export const getAccessToken = (req: AppRequest) =>
  req.get('Authorization')?.split(/\s+/g)[1] || '';

/**
 * creates an error response body
 * @param message error message
 */
export const createErrorResponse = (error: ErrorArg) => {
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'error'
    }
  }

  return {
    message: error.message,
    code: error.code
  };
};

/**
* creates a default server error response body
*/
export const createServerError = () => {
  return createErrorResponse(messages.ERROR_SERVER_ERROR);
};

/**
* sends an error response
* @param res response object
* @param status HTTP status code
* @param message error message
*/
export const sendErrorResponse = (res: AppResponse, status: number, error: ErrorArg) => {
  return res.status(status).send(createErrorResponse(error));
};

/**
* sends a server error response (status 500)
* @param res response object
*/
export const sendServerError = (res: AppResponse) => {
  return res.status(statusCodes.INTERNAL_SERVER_ERROR).send(createServerError());
};

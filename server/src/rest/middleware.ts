import { RequestHandler, ErrorRequestHandler } from 'express';
import { AppError, messages } from '../core';
import { createResourceNotFoundError } from '../core/error';
import { AppRequest, statusCodes } from '../server';
import { sendServerError, sendErrorResponse, getAccessToken } from './util';

export const requireAuth = (): RequestHandler =>
  (req: AppRequest, res, next) => {
    const token = getAccessToken(req);
    if (!token) {
      const err = new AppError(messages.ERROR_INVALID_ACCESS_TOKEN, 'invalidToken');
      return next(err);
    }

    req.core.users.getByToken(token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(next);
  };

export const errorHandler = (): ErrorRequestHandler =>
  (error: AppError, req, res, next) => {
    console.error(error);
    switch (error.code) {
      case 'invalidToken':
      case 'loginFailed':
        return sendErrorResponse(res, statusCodes.STATUS_UNAUTHORIZED, error);
      case 'resourceNotFound':
        return sendErrorResponse(res, statusCodes.STATUS_NOT_FOUND, error);
      case 'uniquenessFailed':
        return sendErrorResponse(res, statusCodes.STATUS_CONFLICT, error);
      case 'paymentRequestFailed':
      case 'nominationFailed':
      case 'validationError':
        return sendErrorResponse(res, statusCodes.STATUS_BAD_REQUEST, error);
      default:
        if (error instanceof SyntaxError) {
          return sendErrorResponse(res, statusCodes.STATUS_BAD_REQUEST,
            `Invalid syntax in request body: ${error.message}`);
        }

        return sendServerError(res);
    }
  };

export const error404Handler = (message: string): RequestHandler =>
  (req, res) =>
    sendErrorResponse(res, statusCodes.STATUS_NOT_FOUND, createResourceNotFoundError(message));


interface WrappedHandler {
  (req: AppRequest): Promise<any>;
}

/**
 * this middleware calls the specified handler function and sends its return value
 * as the API response. It also sends errors from the function to the API error handler.
 *
 * this middleware was created to make it easier to write most handler functions, since
 * they happened to follow a common pattern
 *
 * @example
 * // the following code
 * router.get('endpoint/:id', (req, res, next) => {
 *   getById(req.params.id)
 *      .then(data => res.status(200).send(data))
 *      .catch(next);
 * });
 *
 * // can be rewritten as follows using this wrapResponse
 * router.get('endpoint/:id', wrapResponse((req) => getById(req.params.id)));
 *
 * @param handler
 * @param statusCode status code to send on success
 */
export function wrapResponse(handler: WrappedHandler, statusCode = 200): RequestHandler {
  return (req: AppRequest, res, next) =>
    handler(req).then(result => res.status(statusCode).send(result))
      .catch(next);
}
import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/errors';

type SchemaBundle = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validateRequest = (schemas: SchemaBundle): RequestHandler => {
  return (request, _response, next) => {
    const parsedBody = schemas.body ? schemas.body.safeParse(request.body) : null;
    const parsedQuery = schemas.query ? schemas.query.safeParse(request.query) : null;
    const parsedParams = schemas.params ? schemas.params.safeParse(request.params) : null;

    if (parsedBody && !parsedBody.success) {
      return next(new AppError(400, 'Invalid request body', parsedBody.error.flatten()));
    }

    if (parsedQuery && !parsedQuery.success) {
      return next(new AppError(400, 'Invalid request query', parsedQuery.error.flatten()));
    }

    if (parsedParams && !parsedParams.success) {
      return next(new AppError(400, 'Invalid route parameters', parsedParams.error.flatten()));
    }

    if (parsedBody?.success) {
      request.body = parsedBody.data;
    }

    if (parsedQuery?.success) {
      request.query = parsedQuery.data as typeof request.query;
    }

    if (parsedParams?.success) {
      request.params = parsedParams.data as typeof request.params;
    }

    return next();
  };
};

import type { ErrorRequestHandler } from 'express';
import type { RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({ message: 'Validation failed', issues: error.flatten() });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return response.status(400).json({ message: error.message, code: error.code });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message, details: error.details });
  }

  const statusCode = 500;
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : error instanceof Error ? error.message : 'Unknown error';

  return response.status(statusCode).json({ message });
};

import type { RequestHandler } from 'express';
import { AppError } from '../utils/errors';
import type { AppUserRole } from '../types/app';

export const requireRole = (...roles: AppUserRole[]): RequestHandler => {
  return (request, _response, next) => {
    if (!request.user) {
      return next(new AppError(401, 'Unauthorized'));
    }

    if (!roles.includes(request.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }

    return next();
  };
};

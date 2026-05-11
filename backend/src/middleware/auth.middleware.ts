import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing authorization token');
    }

    const token = authorization.slice(7);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new AppError(401, 'Invalid token');
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return next();
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(401, 'Unauthorized'));
  }
};

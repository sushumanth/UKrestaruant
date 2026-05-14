import type { AppUserRole } from './app';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: AppUserRole;
        firstName: string;
        lastName: string;
        isBlocked?: boolean;
      };
    }
  }
}

export {};

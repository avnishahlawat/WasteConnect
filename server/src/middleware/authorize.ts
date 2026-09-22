import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import type { UserRole } from '../types/enums';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

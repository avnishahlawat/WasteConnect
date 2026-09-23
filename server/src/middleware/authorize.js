import { AppError } from '../utils/AppError.js';
export const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
        }
        if (!roles.includes(req.user.role)) {
            throw new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN');
        }
        next();
    };
};

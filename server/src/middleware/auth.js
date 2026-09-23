import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const authenticate = asyncHandler(async (req, _res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
    }
    let decoded;
    try {
        decoded = verifyToken(token);
    }
    catch {
        throw new AppError('Invalid or expired token', 401, 'TOKEN_INVALID');
    }
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }
    if (!user.isActive) {
        throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }
    req.user = user;
    next();
});

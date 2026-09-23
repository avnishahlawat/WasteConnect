import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { authService } from '../services/authService.js';
import { z } from 'zod';
import { UserRole } from '../types/enums.js';
const registerSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    role: z.enum([UserRole.CITIZEN, UserRole.COLLECTOR]).default(UserRole.CITIZEN),
    phone: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and a number'),
});
export const authController = {
    register: asyncHandler(async (req, res) => {
        const data = registerSchema.parse(req.body);
        const ipAddress = req.ip;
        const { user, token } = await authService.register(data, ipAddress);
        sendSuccess(res, {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        }, 'Account created successfully', 201);
    }),
    login: asyncHandler(async (req, res) => {
        const data = loginSchema.parse(req.body);
        const { user, token } = await authService.login(data, req.ip);
        sendSuccess(res, {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
            },
        }, 'Login successful');
    }),
    googleLogin: asyncHandler(async (req, res) => {
        const { email, firstName = 'User', lastName = 'Citizen', role = UserRole.CITIZEN } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const { user, token } = await authService.googleOrPersonalLogin({ email, firstName, lastName, role }, req.ip);
        sendSuccess(res, {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
            },
        }, 'Authentication successful');
    }),
    logout: asyncHandler(async (_req, res) => {
        // JWT is stateless — client discards token. Future: token blacklist.
        sendSuccess(res, null, 'Logged out successfully');
    }),
    getMe: asyncHandler(async (req, res) => {
        const { user, profile } = await authService.getProfile(req.user._id.toString());
        sendSuccess(res, { user, profile });
    }),
    updateProfile: asyncHandler(async (req, res) => {
        const schema = z.object({
            firstName: z.string().min(1).max(50).optional(),
            lastName: z.string().min(1).max(50).optional(),
            phone: z.string().optional(),
        });
        const data = schema.parse(req.body);
        const user = await authService.updateProfile(req.user._id.toString(), data);
        sendSuccess(res, user, 'Profile updated');
    }),
    changePassword: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        await authService.changePassword(req.user._id.toString(), currentPassword, newPassword);
        sendSuccess(res, null, 'Password changed successfully');
    }),
};

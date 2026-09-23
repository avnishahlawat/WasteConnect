import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { dashboardService } from '../services/dashboardService.js';
import { analyticsService } from '../services/analyticsService.js';
import { hotspotService } from '../services/hotspotService.js';
import { User } from '../models/User.js';
import { CitizenProfile } from '../models/CitizenProfile.js';
import { CollectorProfile } from '../models/CollectorProfile.js';
import { AuthorityProfile } from '../models/AuthorityProfile.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { PublicIssue } from '../models/PublicIssue.js';
import { AuditLog } from '../models/AuditLog.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { WasteCategory } from '../models/WasteCategory.js';
import { AppError } from '../utils/AppError.js';
import { UserRole } from '../types/enums.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
export const adminController = {
    getDashboard: asyncHandler(async (_req, res) => {
        const data = await dashboardService.getAdminDashboard();
        sendSuccess(res, data);
    }),
    getUsers: asyncHandler(async (req, res) => {
        const { role, isActive, search, page = '1', limit = '20' } = req.query;
        const p = parseInt(page, 10);
        const l = parseInt(limit, 10);
        const skip = (p - 1) * l;
        const query = {};
        if (role)
            query.role = role;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(l),
            User.countDocuments(query),
        ]);
        sendSuccess(res, users, 'Users retrieved', 200, { page: p, limit: l, total, totalPages: Math.ceil(total / l) });
    }),
    createUser: asyncHandler(async (req, res) => {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(6),
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            role: z.enum([UserRole.CITIZEN, UserRole.COLLECTOR, UserRole.AUTHORITY, UserRole.ADMIN]),
            phone: z.string().optional(),
            serviceArea: z.string().optional(),
        });
        const data = schema.parse(req.body);
        const existing = await User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new AppError('An account with this email already exists', 409, 'EMAIL_IN_USE');
        }
        const hashedPassword = await bcrypt.hash(data.password, 12);
        const user = await User.create({
            email: data.email.toLowerCase(),
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            phone: data.phone,
            serviceArea: data.serviceArea || undefined,
            isActive: true,
            isEmailVerified: true,
        });

        if (data.role === UserRole.CITIZEN) {
            await CitizenProfile.create({ user: user._id, preferredServiceArea: data.serviceArea || undefined });
        } else if (data.role === UserRole.COLLECTOR) {
            await CollectorProfile.create({ user: user._id, serviceAreas: data.serviceArea ? [data.serviceArea] : [] });
        } else if (data.role === UserRole.AUTHORITY) {
            await AuthorityProfile.create({ user: user._id, serviceAreas: data.serviceArea ? [data.serviceArea] : [], designation: 'Municipal Officer' });
        }

        await AuditLog.create({
            actor: req.user._id,
            actorRole: req.user.role,
            actorEmail: req.user.email,
            action: 'USER_CREATED_BY_ADMIN',
            entityType: 'User',
            entityId: user._id,
            description: `Admin created ${user.role} user ${user.email}`,
        });

        sendSuccess(res, {
            id: user._id,
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        }, 'User created successfully', 201);
    }),
    toggleUserStatus: asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user)
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        user.isActive = !user.isActive;
        await user.save();
        await AuditLog.create({
            actor: req.user._id,
            actorRole: req.user.role,
            actorEmail: req.user.email,
            action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
            entityType: 'User',
            entityId: user._id,
            description: `User ${user.email} status toggled to ${user.isActive ? 'Active' : 'Inactive'}`,
        });
        sendSuccess(res, { id: user._id, isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
    }),
    getCollectors: asyncHandler(async (_req, res) => {
        const collectors = await analyticsService.getCollectorPerformance();
        sendSuccess(res, collectors);
    }),
    getAllIssues: asyncHandler(async (req, res) => {
        const { status, severity, page = '1', limit = '20' } = req.query;
        const p = parseInt(page, 10);
        const l = parseInt(limit, 10);
        const skip = (p - 1) * l;
        const query = {};
        if (status)
            query.status = status;
        if (severity)
            query.severity = severity;
        const [issues, total] = await Promise.all([
            PublicIssue.find(query)
                .populate('serviceArea')
                .populate('reporter', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(l),
            PublicIssue.countDocuments(query),
        ]);
        sendSuccess(res, issues, 'All issues retrieved', 200, { page: p, limit: l, total, totalPages: Math.ceil(total / l) });
    }),
    getAllPickups: asyncHandler(async (req, res) => {
        const { status, page = '1', limit = '20' } = req.query;
        const p = parseInt(page, 10);
        const l = parseInt(limit, 10);
        const skip = (p - 1) * l;
        const query = {};
        if (status)
            query.status = status;
        const [pickups, total] = await Promise.all([
            PickupRequest.find(query)
                .populate('wasteCategory')
                .populate('serviceArea')
                .populate('citizen', 'firstName lastName')
                .populate('assignedCollector', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(l),
            PickupRequest.countDocuments(query),
        ]);
        sendSuccess(res, pickups, 'All pickups retrieved', 200, { page: p, limit: l, total, totalPages: Math.ceil(total / l) });
    }),
    getAuditLogs: asyncHandler(async (req, res) => {
        const { action, page = '1', limit = '30' } = req.query;
        const p = parseInt(page, 10);
        const l = parseInt(limit, 10);
        const skip = (p - 1) * l;
        const query = {};
        if (action)
            query.action = action;
        const [logs, total] = await Promise.all([
            AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
            AuditLog.countDocuments(query),
        ]);
        sendSuccess(res, logs, 'Audit logs retrieved', 200, { page: p, limit: l, total, totalPages: Math.ceil(total / l) });
    }),
    createServiceArea: asyncHandler(async (req, res) => {
        const schema = z.object({
            name: z.string().min(2),
            city: z.string().min(2),
            district: z.string().min(2),
            coordinates: z.object({ lat: z.number(), lng: z.number() }),
            description: z.string().optional(),
        });
        const body = schema.parse(req.body);
        const area = await ServiceArea.create(body);
        sendSuccess(res, area, 'Service area created', 201);
    }),
    updateServiceArea: asyncHandler(async (req, res) => {
        const area = await ServiceArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!area)
            throw new AppError('Service area not found', 404, 'AREA_NOT_FOUND');
        sendSuccess(res, area, 'Service area updated');
    }),
    createWasteCategory: asyncHandler(async (req, res) => {
        const schema = z.object({
            name: z.string().min(2),
            slug: z.string().min(2),
            description: z.string().min(5),
            recyclable: z.boolean().default(false),
            compostable: z.boolean().default(false),
            hazardous: z.boolean().default(false),
            disposalGuidance: z.string().min(5),
            color: z.string().default('#6B7280'),
            icon: z.string().default('trash-2'),
        });
        const body = schema.parse(req.body);
        const cat = await WasteCategory.create(body);
        sendSuccess(res, cat, 'Category created', 201);
    }),
    updateWasteCategory: asyncHandler(async (req, res) => {
        const cat = await WasteCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cat)
            throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
        sendSuccess(res, cat, 'Category updated');
    }),
    getAnalytics: asyncHandler(async (_req, res) => {
        const [wasteStats, issueStats, areaStats, collectorStats, hotspotSummary] = await Promise.all([
            analyticsService.getWasteTrends(6),
            analyticsService.getIssueTrends(6),
            analyticsService.getAreaComparison(),
            analyticsService.getCollectorPerformance(),
            hotspotService.getHotspotSummary(),
        ]);
        sendSuccess(res, { wasteStats, issueStats, areaStats, collectorStats, hotspotSummary });
    }),
};

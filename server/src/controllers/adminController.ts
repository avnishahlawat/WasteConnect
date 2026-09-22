import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { dashboardService } from '../services/dashboardService';
import { analyticsService } from '../services/analyticsService';
import { hotspotService } from '../services/hotspotService';
import { User } from '../models/User';
import { PickupRequest } from '../models/PickupRequest';
import { PublicIssue } from '../models/PublicIssue';
import { AuditLog } from '../models/AuditLog';
import { ServiceArea } from '../models/ServiceArea';
import { WasteCategory } from '../models/WasteCategory';
import { CollectorProfile } from '../models/CollectorProfile';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

export const adminController = {
  getDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const data = await dashboardService.getAdminDashboard();
    sendSuccess(res, data);
  }),

  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const { role, isActive, search, page = '1', limit = '20' } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const skip = (p - 1) * l;

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
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

  toggleUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      actor: req.user!._id,
      actorRole: req.user!.role,
      actorEmail: req.user!.email,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: user._id,
      description: `User ${user.email} status toggled to ${user.isActive ? 'Active' : 'Inactive'}`,
    });

    sendSuccess(res, { id: user._id, isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  }),

  getCollectors: asyncHandler(async (_req: Request, res: Response) => {
    const collectors = await analyticsService.getCollectorPerformance();
    sendSuccess(res, collectors);
  }),

  getAllIssues: asyncHandler(async (req: Request, res: Response) => {
    const { status, severity, page = '1', limit = '20' } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const skip = (p - 1) * l;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

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

  getAllPickups: asyncHandler(async (req: Request, res: Response) => {
    const { status, page = '1', limit = '20' } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const skip = (p - 1) * l;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

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

  getAuditLogs: asyncHandler(async (req: Request, res: Response) => {
    const { action, page = '1', limit = '30' } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const skip = (p - 1) * l;

    const query: Record<string, unknown> = {};
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
      AuditLog.countDocuments(query),
    ]);

    sendSuccess(res, logs, 'Audit logs retrieved', 200, { page: p, limit: l, total, totalPages: Math.ceil(total / l) });
  }),

  createServiceArea: asyncHandler(async (req: Request, res: Response) => {
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

  updateServiceArea: asyncHandler(async (req: Request, res: Response) => {
    const area = await ServiceArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) throw new AppError('Service area not found', 404, 'AREA_NOT_FOUND');
    sendSuccess(res, area, 'Service area updated');
  }),

  createWasteCategory: asyncHandler(async (req: Request, res: Response) => {
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

  updateWasteCategory: asyncHandler(async (req: Request, res: Response) => {
    const cat = await WasteCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    sendSuccess(res, cat, 'Category updated');
  }),

  getAnalytics: asyncHandler(async (_req: Request, res: Response) => {
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

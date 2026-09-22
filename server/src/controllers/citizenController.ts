import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { pickupService } from '../services/pickupService';
import { issueService } from '../services/issueService';
import { dashboardService } from '../services/dashboardService';
import { aiService } from '../services/aiService';
import { z } from 'zod';
import { TimeSlot } from '../types/enums';

const createPickupSchema = z.object({
  wasteCategory: z.string().min(1),
  estimatedQuantity: z.number().positive(),
  unit: z.enum(['kg', 'bags', 'liters', 'items']).default('kg'),
  address: z.string().min(3),
  coordinates: z.tuple([z.number(), z.number()]),
  serviceArea: z.string().min(1),
  preferredDate: z.string(),
  timeSlot: z.enum([TimeSlot.MORNING, TimeSlot.AFTERNOON, TimeSlot.EVENING]),
  notes: z.string().max(500).optional(),
  photos: z.array(z.string()).optional(),
});

const reportIssueSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  photos: z.array(z.string()).optional(),
  address: z.string().min(3),
  coordinates: z.tuple([z.number(), z.number()]),
  serviceArea: z.string().min(1),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
});

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  punctualityRating: z.number().min(1).max(5).optional(),
  professionalismRating: z.number().min(1).max(5).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
});

export const citizenController = {
  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getCitizenDashboard(req.user!._id.toString());
    sendSuccess(res, data);
  }),

  // Pickups
  requestPickup: asyncHandler(async (req: Request, res: Response) => {
    const body = createPickupSchema.parse(req.body);
    const pickup = await pickupService.createPickup(req.user!._id.toString(), body);
    sendSuccess(res, pickup, 'Pickup request created successfully', 201);
  }),

  getPickups: asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;
    const result = await pickupService.getCitizenPickups(req.user!._id.toString(), {
      status: status as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    sendSuccess(res, result.pickups, 'Pickups retrieved', 200, result.meta);
  }),

  getPickupById: asyncHandler(async (req: Request, res: Response) => {
    const result = await pickupService.getPickupById(
      req.params.id,
      req.user!._id.toString(),
      req.user!.role
    );
    sendSuccess(res, result);
  }),

  cancelPickup: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    const pickup = await pickupService.cancelPickup(req.params.id, req.user!._id.toString(), reason);
    sendSuccess(res, pickup, 'Pickup cancelled successfully');
  }),

  submitFeedback: asyncHandler(async (req: Request, res: Response) => {
    const body = feedbackSchema.parse(req.body);
    const feedback = await pickupService.submitFeedback(req.params.id, req.user!._id.toString(), body);
    sendSuccess(res, feedback, 'Feedback submitted successfully', 201);
  }),

  // Issues
  reportIssue: asyncHandler(async (req: Request, res: Response) => {
    const body = reportIssueSchema.parse(req.body);
    const issue = await issueService.reportIssue(req.user!._id.toString(), body);
    sendSuccess(res, issue, 'Public issue reported successfully', 201);
  }),

  getMyIssues: asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;
    const result = await issueService.getIssues({
      reporter: req.user!._id.toString(),
      status: status as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    sendSuccess(res, result.issues, 'Issues retrieved', 200, result.meta);
  }),

  getIssueById: asyncHandler(async (req: Request, res: Response) => {
    const result = await issueService.getIssueById(req.params.id, req.user!.role);
    sendSuccess(res, result);
  }),

  verifyIssueResolution: asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      confirmed: z.boolean(),
      disputeReason: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const issue = await issueService.verifyByCitizen(req.params.id, req.user!._id.toString(), body);
    sendSuccess(res, issue, body.confirmed ? 'Resolution confirmed' : 'Resolution disputed');
  }),

  // AI Assistant preview
  classifyWasteAi: asyncHandler(async (req: Request, res: Response) => {
    const { description } = req.body;
    if (!description) {
      res.status(400).json({ success: false, message: 'Description required' });
      return;
    }
    const result = await aiService.getProvider().classifyWaste(description);
    sendSuccess(res, result, 'Classification complete');
  }),
};

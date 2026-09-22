import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { pickupService } from '../services/pickupService';
import { dashboardService } from '../services/dashboardService';
import { CollectorProfile } from '../models/CollectorProfile';
import { CollectorAvailability, PickupStatus } from '../types/enums';
import { z } from 'zod';

const completePickupSchema = z.object({
  actualQuantity: z.number().positive(),
  collectorNotes: z.string().max(500).optional(),
});

export const collectorController = {
  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getCollectorDashboard(req.user!._id.toString());
    sendSuccess(res, data);
  }),

  getAvailablePickups: asyncHandler(async (req: Request, res: Response) => {
    const { serviceArea, page, limit } = req.query;
    const result = await pickupService.getAvailablePickupsForCollector(req.user!._id.toString(), {
      serviceArea: serviceArea as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    sendSuccess(res, result.pickups, 'Available pickups retrieved', 200, result.meta);
  }),

  getMyPickups: asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;
    const result = await pickupService.getCollectorPickups(req.user!._id.toString(), {
      status: status as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    sendSuccess(res, result.pickups, 'Assigned pickups retrieved', 200, result.meta);
  }),

  acceptPickup: asyncHandler(async (req: Request, res: Response) => {
    const pickup = await pickupService.acceptPickup(req.params.id, req.user!._id.toString());
    sendSuccess(res, pickup, 'Pickup accepted successfully');
  }),

  startPickup: asyncHandler(async (req: Request, res: Response) => {
    const pickup = await pickupService.startPickup(req.params.id, req.user!._id.toString());
    sendSuccess(res, pickup, 'Pickup route started');
  }),

  completePickup: asyncHandler(async (req: Request, res: Response) => {
    const body = completePickupSchema.parse(req.body);
    const pickup = await pickupService.completePickup(req.params.id, req.user!._id.toString(), body);
    sendSuccess(res, pickup, 'Collection completed and recorded');
  }),

  updateAvailability: asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      availability: z.enum([
        CollectorAvailability.AVAILABLE,
        CollectorAvailability.BUSY,
        CollectorAvailability.OFFLINE,
        CollectorAvailability.ON_LEAVE,
      ]),
    });
    const { availability } = schema.parse(req.body);
    const profile = await CollectorProfile.findOneAndUpdate(
      { user: req.user!._id },
      { availability },
      { new: true }
    );
    sendSuccess(res, profile, 'Availability status updated');
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const result = await pickupService.getCollectorPickups(req.user!._id.toString(), {
      status: PickupStatus.COMPLETED,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    sendSuccess(res, result.pickups, 'Collection history retrieved', 200, result.meta);
  }),
};

import { PickupRequest, type IPickupRequest } from '../models/PickupRequest';
import { PickupAssignment } from '../models/PickupAssignment';
import { WasteRecord } from '../models/WasteRecord';
import { Feedback } from '../models/Feedback';
import { CollectorProfile } from '../models/CollectorProfile';
import { CitizenProfile } from '../models/CitizenProfile';
import { Notification } from '../models/Notification';
import { PickupEvent } from '../models/PickupEvent';
import { pickupStateService } from './pickupStateService';
import { AppError } from '../utils/AppError';
import { PickupStatus, UserRole, NotificationType, TimeSlot } from '../types/enums';
import mongoose from 'mongoose';

export interface CreatePickupInput {
  wasteCategory: string;
  estimatedQuantity: number;
  unit: 'kg' | 'bags' | 'liters' | 'items';
  address: string;
  coordinates: [number, number];
  serviceArea: string;
  preferredDate: string;
  timeSlot: TimeSlot;
  notes?: string;
  photos?: string[];
}

export interface CompletePickupInput {
  actualQuantity: number;
  collectorNotes?: string;
}

export interface FeedbackInput {
  rating: number;
  punctualityRating?: number;
  professionalismRating?: number;
  qualityRating?: number;
  comment?: string;
}

export const pickupService = {
  async createPickup(citizenId: string, input: CreatePickupInput): Promise<IPickupRequest> {
    const pickup = await PickupRequest.create({
      citizen: citizenId,
      wasteCategory: input.wasteCategory,
      estimatedQuantity: input.estimatedQuantity,
      unit: input.unit || 'kg',
      address: input.address,
      location: {
        type: 'Point',
        coordinates: input.coordinates,
      },
      serviceArea: input.serviceArea,
      preferredDate: new Date(input.preferredDate),
      timeSlot: input.timeSlot,
      notes: input.notes,
      photos: input.photos || [],
      status: PickupStatus.AVAILABLE, // Available directly for collectors to view in marketplace
    });

    await PickupEvent.create({
      pickupRequest: pickup._id,
      newStatus: PickupStatus.AVAILABLE,
      actor: citizenId,
      actorRole: UserRole.CITIZEN,
      note: 'Pickup requested by citizen',
      timestamp: new Date(),
    });

    // Update citizen profile stats
    await CitizenProfile.findOneAndUpdate(
      { user: citizenId },
      { $inc: { totalPickupsRequested: 1 } }
    );

    // Create confirmation notification
    await Notification.create({
      recipient: citizenId,
      type: NotificationType.PICKUP_CREATED,
      title: 'Pickup Request Received',
      message: `Your pickup request for ${input.estimatedQuantity} ${input.unit} has been received and listed for available collectors.`,
      relatedEntityType: 'PickupRequest',
      relatedEntityId: pickup._id,
    });

    return pickup;
  },

  async getCitizenPickups(
    citizenId: string,
    filters: { status?: string; page?: number; limit?: number } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { citizen: citizenId };
    if (filters.status) query.status = filters.status;

    const [pickups, total] = await Promise.all([
      PickupRequest.find(query)
        .populate('wasteCategory')
        .populate('serviceArea')
        .populate('assignedCollector', 'firstName lastName phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PickupRequest.countDocuments(query),
    ]);

    return {
      pickups,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getPickupById(pickupId: string, userId: string, userRole: string) {
    const pickup = await PickupRequest.findById(pickupId)
      .populate('wasteCategory')
      .populate('serviceArea')
      .populate('citizen', 'firstName lastName email phone')
      .populate('assignedCollector', 'firstName lastName email phone avatar');

    if (!pickup) {
      throw new AppError('Pickup request not found', 404, 'PICKUP_NOT_FOUND');
    }

    // Role-based visibility check
    if (userRole === UserRole.CITIZEN && pickup.citizen._id.toString() !== userId) {
      throw new AppError('Unauthorized to view this pickup request', 403, 'FORBIDDEN');
    }

    const events = await PickupEvent.find({ pickupRequest: pickupId })
      .populate('actor', 'firstName lastName role')
      .sort({ timestamp: 1 });

    const feedback = await Feedback.findOne({ pickupRequest: pickupId });

    return { pickup, events, feedback };
  },

  async cancelPickup(pickupId: string, citizenId: string, reason?: string) {
    const pickup = await PickupRequest.findOne({ _id: pickupId, citizen: citizenId });
    if (!pickup) {
      throw new AppError('Pickup not found or access denied', 404, 'PICKUP_NOT_FOUND');
    }

    if (([PickupStatus.COMPLETED, PickupStatus.CANCELLED] as PickupStatus[]).includes(pickup.status)) {
      throw new AppError(`Cannot cancel a pickup with status ${pickup.status}`, 400, 'CANNOT_CANCEL');
    }

    await pickupStateService.transition(
      pickup._id,
      PickupStatus.CANCELLED,
      citizenId,
      UserRole.CITIZEN,
      reason || 'Cancelled by citizen'
    );

    // If assigned to collector, notify collector
    if (pickup.assignedCollector) {
      await Notification.create({
        recipient: pickup.assignedCollector,
        type: NotificationType.PICKUP_CANCELLED,
        title: 'Pickup Cancelled',
        message: `Pickup scheduled at ${pickup.address} was cancelled by the citizen.`,
        relatedEntityType: 'PickupRequest',
        relatedEntityId: pickup._id,
      });
    }

    return pickup;
  },

  async getAvailablePickupsForCollector(
    collectorId: string,
    filters: { serviceArea?: string; page?: number; limit?: number } = {}
  ) {
    const profile = await CollectorProfile.findOne({ user: collectorId });
    const allowedAreas = profile?.serviceAreas || [];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      status: { $in: [PickupStatus.AVAILABLE, PickupStatus.PENDING] },
    };

    if (filters.serviceArea) {
      query.serviceArea = filters.serviceArea;
    } else if (allowedAreas.length > 0) {
      query.serviceArea = { $in: allowedAreas };
    }

    const [pickups, total] = await Promise.all([
      PickupRequest.find(query)
        .populate('wasteCategory')
        .populate('serviceArea')
        .sort({ preferredDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PickupRequest.countDocuments(query),
    ]);

    return {
      pickups,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getCollectorPickups(
    collectorId: string,
    filters: { status?: string; page?: number; limit?: number } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { assignedCollector: collectorId };
    if (filters.status) query.status = filters.status;

    const [pickups, total] = await Promise.all([
      PickupRequest.find(query)
        .populate('wasteCategory')
        .populate('serviceArea')
        .populate('citizen', 'firstName lastName phone')
        .sort({ preferredDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PickupRequest.countDocuments(query),
    ]);

    return {
      pickups,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async acceptPickup(pickupId: string, collectorId: string) {
    const pickup = await PickupRequest.findById(pickupId);
    if (!pickup) throw new AppError('Pickup not found', 404, 'PICKUP_NOT_FOUND');

    if (!([PickupStatus.AVAILABLE, PickupStatus.PENDING] as PickupStatus[]).includes(pickup.status)) {
      throw new AppError('Pickup is no longer available for acceptance', 400, 'PICKUP_UNAVAILABLE');
    }

    await pickupStateService.transition(
      pickup._id,
      PickupStatus.ACCEPTED,
      collectorId,
      UserRole.COLLECTOR,
      'Accepted by collector',
      { assignedCollector: collectorId }
    );

    // Save assignment record
    await PickupAssignment.findOneAndUpdate(
      { pickupRequest: pickup._id },
      { collector: collectorId, assignedBy: collectorId, assignedAt: new Date() },
      { upsert: true }
    );

    // Notify citizen
    await Notification.create({
      recipient: pickup.citizen,
      type: NotificationType.PICKUP_ACCEPTED,
      title: 'Collector Assigned',
      message: 'A collector has accepted your waste pickup request.',
      relatedEntityType: 'PickupRequest',
      relatedEntityId: pickup._id,
    });

    return pickup;
  },

  async startPickup(pickupId: string, collectorId: string) {
    const pickup = await PickupRequest.findOne({ _id: pickupId, assignedCollector: collectorId });
    if (!pickup) throw new AppError('Pickup not found or not assigned to you', 404, 'PICKUP_NOT_FOUND');

    await pickupStateService.transition(
      pickup._id,
      PickupStatus.IN_PROGRESS,
      collectorId,
      UserRole.COLLECTOR,
      'Collector started collection route'
    );

    await Notification.create({
      recipient: pickup.citizen,
      type: NotificationType.PICKUP_STARTED,
      title: 'Collector On The Way',
      message: 'Your waste collector has started towards your collection address.',
      relatedEntityType: 'PickupRequest',
      relatedEntityId: pickup._id,
    });

    return pickup;
  },

  async completePickup(pickupId: string, collectorId: string, input: CompletePickupInput) {
    const pickup = await PickupRequest.findOne({ _id: pickupId, assignedCollector: collectorId });
    if (!pickup) throw new AppError('Pickup not found or not assigned to you', 404, 'PICKUP_NOT_FOUND');

    if (pickup.status !== PickupStatus.IN_PROGRESS) {
      throw new AppError('Pickup must be in progress to complete', 400, 'INVALID_STATUS');
    }

    const actualQty = input.actualQuantity > 0 ? input.actualQuantity : pickup.estimatedQuantity;

    await pickupStateService.transition(
      pickup._id,
      PickupStatus.COMPLETED,
      collectorId,
      UserRole.COLLECTOR,
      input.collectorNotes || 'Waste collection successfully completed',
      {
        actualQuantity: actualQty,
        collectorNotes: input.collectorNotes,
      }
    );

    // Generate formal WasteRecord
    await WasteRecord.create({
      pickupRequest: pickup._id,
      citizen: pickup.citizen,
      collector: collectorId,
      wasteCategory: pickup.wasteCategory,
      serviceArea: pickup.serviceArea,
      estimatedQuantity: pickup.estimatedQuantity,
      actualQuantity: actualQty,
      unit: pickup.unit,
      collectedAt: new Date(),
      location: pickup.location,
      notes: input.collectorNotes,
    });

    // Update collector stats
    await CollectorProfile.findOneAndUpdate(
      { user: collectorId },
      {
        $inc: {
          totalCollections: 1,
          totalWeightCollected: actualQty,
        },
      }
    );

    // Update citizen stats
    await CitizenProfile.findOneAndUpdate(
      { user: pickup.citizen },
      { $inc: { totalPickupsCompleted: 1 } }
    );

    // Notify citizen with review prompt
    await Notification.create({
      recipient: pickup.citizen,
      type: NotificationType.PICKUP_COMPLETED,
      title: 'Waste Collected Successfully',
      message: `Your waste collection was completed (${actualQty} ${pickup.unit}). Please rate your collector's service!`,
      relatedEntityType: 'PickupRequest',
      relatedEntityId: pickup._id,
    });

    return pickup;
  },

  async submitFeedback(pickupId: string, citizenId: string, input: FeedbackInput) {
    const pickup = await PickupRequest.findOne({ _id: pickupId, citizen: citizenId });
    if (!pickup) throw new AppError('Pickup not found', 404, 'PICKUP_NOT_FOUND');

    if (pickup.status !== PickupStatus.COMPLETED) {
      throw new AppError('Feedback can only be provided for completed collections', 400, 'NOT_COMPLETED');
    }

    if (!pickup.assignedCollector) {
      throw new AppError('No collector associated with this pickup', 400, 'NO_COLLECTOR');
    }

    const existingFeedback = await Feedback.findOne({ pickupRequest: pickupId });
    if (existingFeedback) {
      throw new AppError('Feedback already submitted for this pickup', 409, 'FEEDBACK_EXISTS');
    }

    const feedback = await Feedback.create({
      pickupRequest: pickup._id,
      citizen: citizenId,
      collector: pickup.assignedCollector,
      rating: input.rating,
      punctualityRating: input.punctualityRating,
      professionalismRating: input.professionalismRating,
      qualityRating: input.qualityRating,
      comment: input.comment,
    });

    // Recalculate collector average rating
    const collectorFeedbacks = await Feedback.find({ collector: pickup.assignedCollector });
    const avgRating =
      collectorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / collectorFeedbacks.length;

    await CollectorProfile.findOneAndUpdate(
      { user: pickup.assignedCollector },
      {
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: collectorFeedbacks.length,
      }
    );

    return feedback;
  },
};

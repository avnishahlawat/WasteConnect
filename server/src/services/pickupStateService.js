import { PickupStatus } from '../types/enums.js';
import { AppError } from '../utils/AppError.js';
import { PickupEvent } from '../models/PickupEvent.js';
import { PickupRequest } from '../models/PickupRequest.js';
/**
 * Valid state transitions for a Private Waste Pickup Request:
 * PENDING -> AVAILABLE -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED
 * Any pre-completion state -> CANCELLED (by citizen or authority)
 * PENDING, AVAILABLE, ASSIGNED -> REJECTED (by authority or collector)
 */
const ALLOWED_TRANSITIONS = {
    PENDING: [PickupStatus.AVAILABLE, PickupStatus.ASSIGNED, PickupStatus.CANCELLED, PickupStatus.REJECTED],
    AVAILABLE: [PickupStatus.ASSIGNED, PickupStatus.ACCEPTED, PickupStatus.CANCELLED, PickupStatus.REJECTED],
    ASSIGNED: [PickupStatus.ACCEPTED, PickupStatus.AVAILABLE, PickupStatus.CANCELLED, PickupStatus.REJECTED],
    ACCEPTED: [PickupStatus.SCHEDULED, PickupStatus.IN_PROGRESS, PickupStatus.AVAILABLE, PickupStatus.CANCELLED],
    SCHEDULED: [PickupStatus.IN_PROGRESS, PickupStatus.CANCELLED],
    IN_PROGRESS: [PickupStatus.COMPLETED, PickupStatus.CANCELLED],
    COMPLETED: [], // Terminal
    CANCELLED: [], // Terminal
    REJECTED: [PickupStatus.AVAILABLE, PickupStatus.CANCELLED],
};
export const pickupStateService = {
    isValidTransition(currentStatus, newStatus) {
        const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
        return allowed.includes(newStatus);
    },
    async transition(pickupId, newStatus, actorId, actorRole, note, extraUpdates = {}) {
        const pickup = await PickupRequest.findById(pickupId);
        if (!pickup) {
            throw new AppError('Pickup request not found', 404, 'PICKUP_NOT_FOUND');
        }
        if (!this.isValidTransition(pickup.status, newStatus)) {
            throw new AppError(`Invalid status transition from ${pickup.status} to ${newStatus}`, 400, 'INVALID_STATUS_TRANSITION');
        }
        const previousStatus = pickup.status;
        pickup.status = newStatus;
        if (newStatus === PickupStatus.IN_PROGRESS && !pickup.startedAt) {
            pickup.startedAt = new Date();
        }
        if (newStatus === PickupStatus.COMPLETED) {
            pickup.completedAt = new Date();
        }
        if (newStatus === PickupStatus.CANCELLED) {
            pickup.cancelledAt = new Date();
            if (note)
                pickup.cancellationReason = note;
        }
        Object.assign(pickup, extraUpdates);
        await pickup.save();
        const event = await PickupEvent.create({
            pickupRequest: pickup._id,
            previousStatus,
            newStatus,
            actor: actorId,
            actorRole,
            note,
            metadata: extraUpdates,
            timestamp: new Date(),
        });
        return { pickup, event };
    },
};

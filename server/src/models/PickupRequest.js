import mongoose, { Schema } from 'mongoose';
import { PickupStatus, TimeSlot } from '../types/enums.js';
const pickupRequestSchema = new Schema({
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wasteCategory: { type: Schema.Types.ObjectId, ref: 'WasteCategory', required: true },
    estimatedQuantity: { type: Number, required: true, min: 0.1 },
    actualQuantity: { type: Number, min: 0 },
    unit: { type: String, required: true, default: 'kg', enum: ['kg', 'bags', 'liters', 'items'] },
    address: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
    },
    serviceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea', required: true },
    preferredDate: { type: Date, required: true },
    timeSlot: { type: String, enum: Object.values(TimeSlot), required: true },
    notes: { type: String, maxlength: 500 },
    photos: [{ type: String }],
    status: {
        type: String,
        enum: Object.values(PickupStatus),
        default: PickupStatus.PENDING,
    },
    assignedCollector: { type: Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    collectorNotes: { type: String },
}, { timestamps: true });
pickupRequestSchema.index({ citizen: 1 });
pickupRequestSchema.index({ status: 1 });
pickupRequestSchema.index({ serviceArea: 1 });
pickupRequestSchema.index({ assignedCollector: 1 });
pickupRequestSchema.index({ preferredDate: 1 });
pickupRequestSchema.index({ location: '2dsphere' });
export const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

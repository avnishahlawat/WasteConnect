import mongoose, { Schema } from 'mongoose';
import { CollectorAvailability } from '../types/enums.js';
const collectorProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    serviceAreas: [{ type: Schema.Types.ObjectId, ref: 'ServiceArea' }],
    availability: {
        type: String,
        enum: Object.values(CollectorAvailability),
        default: CollectorAvailability.AVAILABLE,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalCollections: { type: Number, default: 0 },
    totalWeightCollected: { type: Number, default: 0 },
    vehicleType: { type: String },
    vehicleNumber: { type: String },
    specializations: [{ type: Schema.Types.ObjectId, ref: 'WasteCategory' }],
    bio: { type: String },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });
collectorProfileSchema.index({ availability: 1 });
collectorProfileSchema.index({ serviceAreas: 1 });
export const CollectorProfile = mongoose.model('CollectorProfile', collectorProfileSchema);

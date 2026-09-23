import mongoose, { Schema } from 'mongoose';
import { HotspotLevel } from '../types/enums.js';
const serviceAreaSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    city: { type: String, required: true, default: 'Greenfield' },
    district: { type: String, required: true },
    description: { type: String },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    hotspotScore: { type: Number, default: 0, min: 0, max: 100 },
    hotspotLevel: {
        type: String,
        enum: Object.values(HotspotLevel),
        default: HotspotLevel.LOW,
    },
    hotspotLastCalculated: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
serviceAreaSchema.index({ city: 1 });
serviceAreaSchema.index({ hotspotScore: -1 });
export const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);

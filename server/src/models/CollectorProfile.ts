import mongoose, { Document, Schema } from 'mongoose';
import { CollectorAvailability } from '../types/enums';

export interface ICollectorProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  serviceAreas: mongoose.Types.ObjectId[];
  availability: CollectorAvailability;
  rating: number;
  totalRatings: number;
  totalCollections: number;
  totalWeightCollected: number;
  vehicleType?: string;
  vehicleNumber?: string;
  specializations: mongoose.Types.ObjectId[];
  bio?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const collectorProfileSchema = new Schema<ICollectorProfile>(
  {
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
  },
  { timestamps: true }
);

collectorProfileSchema.index({ availability: 1 });
collectorProfileSchema.index({ serviceAreas: 1 });

export const CollectorProfile = mongoose.model<ICollectorProfile>('CollectorProfile', collectorProfileSchema);

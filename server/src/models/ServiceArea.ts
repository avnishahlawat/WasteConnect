import mongoose, { Document, Schema } from 'mongoose';
import { HotspotLevel } from '../types/enums';

export interface IServiceArea extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  city: string;
  district: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  hotspotScore: number;
  hotspotLevel: HotspotLevel;
  hotspotLastCalculated?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceAreaSchema = new Schema<IServiceArea>(
  {
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
  },
  { timestamps: true }
);

serviceAreaSchema.index({ city: 1 });
serviceAreaSchema.index({ hotspotScore: -1 });

export const ServiceArea = mongoose.model<IServiceArea>('ServiceArea', serviceAreaSchema);

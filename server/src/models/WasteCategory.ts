import mongoose, { Document, Schema } from 'mongoose';

export interface IWasteCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  recyclable: boolean;
  compostable: boolean;
  hazardous: boolean;
  disposalGuidance: string;
  color: string;
  icon: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wasteCategorySchema = new Schema<IWasteCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    recyclable: { type: Boolean, default: false },
    compostable: { type: Boolean, default: false },
    hazardous: { type: Boolean, default: false },
    disposalGuidance: { type: String, required: true },
    color: { type: String, default: '#6B7280' },
    icon: { type: String, default: 'trash-2' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

wasteCategorySchema.index({ active: 1 });

export const WasteCategory = mongoose.model<IWasteCategory>('WasteCategory', wasteCategorySchema);

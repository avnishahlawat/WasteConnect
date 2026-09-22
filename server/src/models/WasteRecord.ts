import mongoose, { Document, Schema } from 'mongoose';

export interface IWasteRecord extends Document {
  _id: mongoose.Types.ObjectId;
  pickupRequest: mongoose.Types.ObjectId;
  citizen: mongoose.Types.ObjectId;
  collector: mongoose.Types.ObjectId;
  wasteCategory: mongoose.Types.ObjectId;
  serviceArea: mongoose.Types.ObjectId;
  estimatedQuantity: number;
  actualQuantity: number;
  unit: string;
  collectedAt: Date;
  location: { type: string; coordinates: [number, number] };
  notes?: string;
  createdAt: Date;
}

const wasteRecordSchema = new Schema<IWasteRecord>(
  {
    pickupRequest: { type: Schema.Types.ObjectId, ref: 'PickupRequest', required: true },
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wasteCategory: { type: Schema.Types.ObjectId, ref: 'WasteCategory', required: true },
    serviceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea', required: true },
    estimatedQuantity: { type: Number, required: true },
    actualQuantity: { type: Number, required: true },
    unit: { type: String, required: true },
    collectedAt: { type: Date, required: true, default: Date.now },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

wasteRecordSchema.index({ citizen: 1 });
wasteRecordSchema.index({ collector: 1 });
wasteRecordSchema.index({ wasteCategory: 1 });
wasteRecordSchema.index({ serviceArea: 1 });
wasteRecordSchema.index({ collectedAt: -1 });

export const WasteRecord = mongoose.model<IWasteRecord>('WasteRecord', wasteRecordSchema);

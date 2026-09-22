import mongoose, { Document, Schema } from 'mongoose';
import { PickupStatus, UserRole } from '../types/enums';

export interface IPickupEvent extends Document {
  _id: mongoose.Types.ObjectId;
  pickupRequest: mongoose.Types.ObjectId;
  previousStatus?: PickupStatus;
  newStatus: PickupStatus;
  actor: mongoose.Types.ObjectId;
  actorRole: UserRole;
  note?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const pickupEventSchema = new Schema<IPickupEvent>(
  {
    pickupRequest: { type: Schema.Types.ObjectId, ref: 'PickupRequest', required: true },
    previousStatus: { type: String, enum: Object.values(PickupStatus) },
    newStatus: { type: String, enum: Object.values(PickupStatus), required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: Object.values(UserRole), required: true },
    note: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

pickupEventSchema.index({ pickupRequest: 1, timestamp: 1 });

export const PickupEvent = mongoose.model<IPickupEvent>('PickupEvent', pickupEventSchema);

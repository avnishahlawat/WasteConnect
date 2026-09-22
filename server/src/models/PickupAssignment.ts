import mongoose, { Document, Schema } from 'mongoose';

export interface IPickupAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  pickupRequest: mongoose.Types.ObjectId;
  collector: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pickupAssignmentSchema = new Schema<IPickupAssignment>(
  {
    pickupRequest: { type: Schema.Types.ObjectId, ref: 'PickupRequest', required: true, unique: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

pickupAssignmentSchema.index({ collector: 1 });

export const PickupAssignment = mongoose.model<IPickupAssignment>('PickupAssignment', pickupAssignmentSchema);

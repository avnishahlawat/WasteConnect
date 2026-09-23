import mongoose, { Schema } from 'mongoose';
const pickupAssignmentSchema = new Schema({
    pickupRequest: { type: Schema.Types.ObjectId, ref: 'PickupRequest', required: true, unique: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },
    notes: { type: String },
}, { timestamps: true });
pickupAssignmentSchema.index({ collector: 1 });
export const PickupAssignment = mongoose.model('PickupAssignment', pickupAssignmentSchema);

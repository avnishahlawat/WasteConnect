import mongoose, { Schema } from 'mongoose';
const wasteRecordSchema = new Schema({
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
}, { timestamps: true });
wasteRecordSchema.index({ citizen: 1 });
wasteRecordSchema.index({ collector: 1 });
wasteRecordSchema.index({ wasteCategory: 1 });
wasteRecordSchema.index({ serviceArea: 1 });
wasteRecordSchema.index({ collectedAt: -1 });
export const WasteRecord = mongoose.model('WasteRecord', wasteRecordSchema);

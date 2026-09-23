import mongoose, { Schema } from 'mongoose';
const wasteCategorySchema = new Schema({
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
}, { timestamps: true });
wasteCategorySchema.index({ active: 1 });
export const WasteCategory = mongoose.model('WasteCategory', wasteCategorySchema);

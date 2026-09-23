import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../types/enums.js';
const announcementSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'ALERT', 'SCHEDULE'], default: 'INFO' },
    targetRole: {
        type: String,
        enum: [...Object.values(UserRole), 'ALL'],
        default: 'ALL',
    },
    targetServiceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea' },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
}, { timestamps: true });
announcementSchema.index({ isActive: 1, publishedAt: -1 });
announcementSchema.index({ targetServiceArea: 1 });
export const Announcement = mongoose.model('Announcement', announcementSchema);

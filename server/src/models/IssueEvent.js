import mongoose, { Schema } from 'mongoose';
import { IssueStatus, UserRole } from '../types/enums.js';
const issueEventSchema = new Schema({
    issue: { type: Schema.Types.ObjectId, ref: 'PublicIssue', required: true },
    previousStatus: { type: String, enum: Object.values(IssueStatus) },
    newStatus: { type: String, enum: Object.values(IssueStatus), required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: Object.values(UserRole), required: true },
    note: { type: String },
    isPublic: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: false });
issueEventSchema.index({ issue: 1, timestamp: 1 });
export const IssueEvent = mongoose.model('IssueEvent', issueEventSchema);

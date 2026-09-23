import mongoose, { Schema } from 'mongoose';
const citizenProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    address: { type: String },
    city: { type: String },
    preferredServiceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea' },
    totalPickupsRequested: { type: Number, default: 0 },
    totalPickupsCompleted: { type: Number, default: 0 },
    totalIssuesReported: { type: Number, default: 0 },
    totalIssuesResolved: { type: Number, default: 0 },
}, { timestamps: true });
export const CitizenProfile = mongoose.model('CitizenProfile', citizenProfileSchema);

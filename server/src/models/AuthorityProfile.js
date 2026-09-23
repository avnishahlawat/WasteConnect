import mongoose, { Schema } from 'mongoose';
const authorityProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    serviceAreas: [{ type: Schema.Types.ObjectId, ref: 'ServiceArea' }],
    designation: { type: String, required: true, default: 'Municipal Officer' },
    department: { type: String, required: true, default: 'Sanitation Department' },
    employeeId: { type: String },
}, { timestamps: true });
authorityProfileSchema.index({ serviceAreas: 1 });
export const AuthorityProfile = mongoose.model('AuthorityProfile', authorityProfileSchema);

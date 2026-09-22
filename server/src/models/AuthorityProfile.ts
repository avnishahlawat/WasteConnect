import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthorityProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  serviceAreas: mongoose.Types.ObjectId[];
  designation: string;
  department: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authorityProfileSchema = new Schema<IAuthorityProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    serviceAreas: [{ type: Schema.Types.ObjectId, ref: 'ServiceArea' }],
    designation: { type: String, required: true, default: 'Municipal Officer' },
    department: { type: String, required: true, default: 'Sanitation Department' },
    employeeId: { type: String },
  },
  { timestamps: true }
);

authorityProfileSchema.index({ serviceAreas: 1 });

export const AuthorityProfile = mongoose.model<IAuthorityProfile>('AuthorityProfile', authorityProfileSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface ICitizenProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  address?: string;
  city?: string;
  preferredServiceArea?: mongoose.Types.ObjectId;
  totalPickupsRequested: number;
  totalPickupsCompleted: number;
  totalIssuesReported: number;
  totalIssuesResolved: number;
  createdAt: Date;
  updatedAt: Date;
}

const citizenProfileSchema = new Schema<ICitizenProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    address: { type: String },
    city: { type: String },
    preferredServiceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea' },
    totalPickupsRequested: { type: Number, default: 0 },
    totalPickupsCompleted: { type: Number, default: 0 },
    totalIssuesReported: { type: Number, default: 0 },
    totalIssuesResolved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CitizenProfile = mongoose.model<ICitizenProfile>('CitizenProfile', citizenProfileSchema);

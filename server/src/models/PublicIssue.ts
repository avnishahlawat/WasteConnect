import mongoose, { Document, Schema } from 'mongoose';
import { IssueStatus, Severity, Priority, VerificationStatus, CitizenVerification } from '../types/enums';

export interface IPublicIssue extends Document {
  _id: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  category: string;
  title: string;
  description: string;
  photos: string[];
  location: { type: string; coordinates: [number, number] };
  address: string;
  serviceArea: mongoose.Types.ObjectId;
  severity: Severity;
  status: IssueStatus;
  priority: Priority;
  assignedAuthority?: mongoose.Types.ObjectId;
  assignedTeam?: string;
  internalNotes?: string;
  resolutionNotes?: string;
  resolutionEvidence: string[];
  duplicateOf?: mongoose.Types.ObjectId;
  verificationStatus: VerificationStatus;
  citizenVerification: CitizenVerification;
  isOverdue: boolean;
  overdueAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const publicIssueSchema = new Schema<IPublicIssue>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    photos: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    serviceArea: { type: Schema.Types.ObjectId, ref: 'ServiceArea', required: true },
    severity: { type: String, enum: Object.values(Severity), required: true, default: Severity.MODERATE },
    status: { type: String, enum: Object.values(IssueStatus), default: IssueStatus.REPORTED },
    priority: { type: String, enum: Object.values(Priority), default: Priority.MEDIUM },
    assignedAuthority: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTeam: { type: String },
    internalNotes: { type: String, select: false },
    resolutionNotes: { type: String },
    resolutionEvidence: [{ type: String }],
    duplicateOf: { type: Schema.Types.ObjectId, ref: 'PublicIssue' },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    citizenVerification: {
      type: String,
      enum: Object.values(CitizenVerification),
      default: CitizenVerification.PENDING,
    },
    isOverdue: { type: Boolean, default: false },
    overdueAt: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

publicIssueSchema.index({ reporter: 1 });
publicIssueSchema.index({ status: 1 });
publicIssueSchema.index({ serviceArea: 1 });
publicIssueSchema.index({ priority: -1 });
publicIssueSchema.index({ severity: 1 });
publicIssueSchema.index({ assignedAuthority: 1 });
publicIssueSchema.index({ location: '2dsphere' });
publicIssueSchema.index({ createdAt: -1 });
publicIssueSchema.index({ isOverdue: 1 });

export const PublicIssue = mongoose.model<IPublicIssue>('PublicIssue', publicIssueSchema);

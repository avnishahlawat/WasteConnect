import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  entityType: 'PickupRequest' | 'PublicIssue';
  entityId: mongoose.Types.ObjectId;
  provider: string;
  modelName: string;
  task: 'WASTE_CLASSIFICATION' | 'ISSUE_CLASSIFICATION' | 'SUMMARIZATION' | 'ANALYTICS_SUMMARY';
  inputSummary?: string;
  output: Record<string, unknown>;
  confidence?: number;
  predictedCategory?: string;
  actualCategory?: string;
  isOverridden: boolean;
  createdAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    entityType: { type: String, enum: ['PickupRequest', 'PublicIssue'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    provider: { type: String, required: true },
    modelName: { type: String, required: true },
    task: {
      type: String,
      enum: ['WASTE_CLASSIFICATION', 'ISSUE_CLASSIFICATION', 'SUMMARIZATION', 'ANALYTICS_SUMMARY'],
      required: true,
    },
    inputSummary: { type: String },
    output: { type: Schema.Types.Mixed, required: true },
    confidence: { type: Number, min: 0, max: 1 },
    predictedCategory: { type: String },
    actualCategory: { type: String },
    isOverridden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

aiAnalysisSchema.index({ entityType: 1, entityId: 1 });
aiAnalysisSchema.index({ task: 1 });

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);

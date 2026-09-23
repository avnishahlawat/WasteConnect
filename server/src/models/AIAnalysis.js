import mongoose, { Schema } from 'mongoose';
const aiAnalysisSchema = new Schema({
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
}, { timestamps: true });
aiAnalysisSchema.index({ entityType: 1, entityId: 1 });
aiAnalysisSchema.index({ task: 1 });
export const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);

import mongoose, { Schema } from 'mongoose';
const feedbackSchema = new Schema({
    pickupRequest: { type: Schema.Types.ObjectId, ref: 'PickupRequest', required: true, unique: true },
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    punctualityRating: { type: Number, min: 1, max: 5 },
    professionalismRating: { type: Number, min: 1, max: 5 },
    qualityRating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
}, { timestamps: true });
feedbackSchema.index({ collector: 1 });
feedbackSchema.index({ citizen: 1 });
export const Feedback = mongoose.model('Feedback', feedbackSchema);

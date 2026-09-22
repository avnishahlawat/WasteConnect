import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  pickupRequest: mongoose.Types.ObjectId;
  citizen: mongoose.Types.ObjectId;
  collector: mongoose.Types.ObjectId;
  rating: number;
  punctualityRating?: number;
  professionalismRating?: number;
  qualityRating?: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    pickupRequest: { type: Schema.Types.ObjectId, ref: 'PickupRequest', required: true, unique: true },
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    punctualityRating: { type: Number, min: 1, max: 5 },
    professionalismRating: { type: Number, min: 1, max: 5 },
    qualityRating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

feedbackSchema.index({ collector: 1 });
feedbackSchema.index({ citizen: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);

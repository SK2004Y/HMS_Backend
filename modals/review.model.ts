import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  rating: number; // e.g. 1 to 5
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DoctorModel",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IReview>("Review", ReviewSchema);

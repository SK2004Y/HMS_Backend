import mongoose, { Schema, Document } from "mongoose";

export interface IAvailability extends Document {
  doctor: mongoose.Types.ObjectId;
  availableDate: Date;
  timeSlots: string[]; // e.g. ["09:00", "10:00", "11:00"]
}

const availabilitySchema = new Schema<IAvailability>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "DoctorModel",
      required: true,
    },
    availableDate: {
      type: Date,
      required: true,
    },
    timeSlots: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const AvailabilityModel = mongoose.model<IAvailability>(
  "Availability",
  availabilitySchema
);

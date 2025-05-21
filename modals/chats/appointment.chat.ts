import mongoose, { Schema, Document } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface IAppointmentChat extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointmentDate: Date;
  reason?: string;
  status: AppointmentStatus;
  queueNumber?: number;
  createdAt: Date;
}

const appointmentChatSchema = new Schema<IAppointmentChat>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    reason: { type: String, default: "General Consultation" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    queueNumber: { type: Number},
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointmentChat>(
  "AppointmentChat",
  appointmentChatSchema
);







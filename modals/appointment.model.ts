import mongoose, { Schema, Document } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointmentDate: Date;
  reason?: string;  
  status: AppointmentStatus;
  queueNumber: number;
  createdAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "DoctorModel",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      default: "General Consultation",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    queueNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔁 Smart Queuing: Auto-assign queue number for the doctor’s appointments on the same day
appointmentSchema.pre<IAppointment>("validate", async function (next) {
  if (!this.isNew) return next();

  const dayStart = new Date(this.appointmentDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(this.appointmentDate);
  dayEnd.setHours(23, 59, 59, 999);

  const sameDayAppointments = await mongoose
    .model<IAppointment>("Appointment")
    .countDocuments({
      doctor: this.doctor,
      appointmentDate: {
        $gte: dayStart,
        $lte: dayEnd,
      },
    });

  this.queueNumber = sameDayAppointments + 1;
  next();
});

// 📌 Optional: Add index for better query performance
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);

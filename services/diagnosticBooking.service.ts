import mongoose, { Schema } from "mongoose";

interface IDiagnosticBooking extends Document {
  userId: mongoose.Types.ObjectId;
  diagnosticId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  preferredDate: Date;
  status: "pending" | "approved" | "completed";
}

const DiagnosticBookingSchema = new Schema<IDiagnosticBooking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    diagnosticId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiagnosticModel",
      required: true,
    },
    testId: { type: mongoose.Schema.Types.ObjectId, required: true },
    preferredDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const DiagnosticBookingModel = mongoose.model<IDiagnosticBooking>(
  "DiagnosticBooking",
  DiagnosticBookingSchema
);

import mongoose, { Document, Schema } from "mongoose";

export interface ITreatment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  diagnosis: string;
  treatmentPlan: string;
  prescribedMedications: string[];
  notes?: string;
  followUpDate?: Date;
}

const treatmentSchema = new Schema<ITreatment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, required: true },
    treatmentPlan: { type: String, required: true },
    prescribedMedications: [{ type: String }],
    notes: { type: String },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

export const Treatment = mongoose.model<ITreatment>(
  "Treatment",
  treatmentSchema
);

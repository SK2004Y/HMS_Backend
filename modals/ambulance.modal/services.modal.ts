

import mongoose, { Document, Schema } from "mongoose";




export interface IAmbulanceVehicle {
  type: "ambulance" | "non-ambulance";
  subType: string;
  registrationNumber: string;
  insuranceFrom: Date;
  insuranceTo: Date;
  declarationAccepted: boolean;
  declarationDate: Date;
  declarationPlace: string;
  mobile: string;
  otpVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}









const ambulanceVehicleSchema = new Schema<IAmbulanceVehicle>(
  {
    type: {
      type: String,
      enum: ["ambulance", "non-ambulance"],
      required: true,
    },
    subType: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    insuranceFrom: {
      type: Date,
      required: true,
    },
    insuranceTo: {
      type: Date,
      required: true,
    },
    declarationAccepted: {
      type: Boolean,
      required: true,
    },
    declarationDate: {
      type: Date,
      required: true,
    },
    declarationPlace: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧠 If already compiled, use existing model
export const AmbulanceVehicle =
  mongoose.models.AmbulanceVehicle ||
  mongoose.model<IAmbulanceVehicle>(
    "AmbulanceVehicle",
    ambulanceVehicleSchema
  );

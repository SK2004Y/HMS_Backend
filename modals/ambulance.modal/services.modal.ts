

import mongoose, { Document, Schema } from "mongoose";




export interface IAmbulanceVehicle {
  userId: mongoose.Types.ObjectId;
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
  serviceType?:string;
  updatedAt?: Date;
}









const ambulanceVehicleSchema = new Schema<IAmbulanceVehicle>(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
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
    serviceType: {
      type: String,
      default: "ambulance",
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

import mongoose, { Schema, Document } from "mongoose";

export interface IOffice extends Document {
  officetype: "physical" | "virtual";
  name: string;
  address?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    city?: string;
    state?: string;
    pincode?: string;
  };
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  charge: number;
  isPermanent?: boolean; //isPermanent when it's true means permanently. assings the office space or not temporarly
  assignedTo?: mongoose.Types.ObjectId;
  assignedDate?: Date;
  paymentDate: Date;
  paymentStatus: "pending" | "paid";
  razorpayOrderId?: string;
}

const officeSchema = new Schema<IOffice>(
  {
    officetype: {
      type: String,
      enum: ["physical", "virtual"],
      required: true,
    },
    name: { type: String, required: true },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    charge: { type: Number, required: true },
    isPermanent: { type: Boolean, default: false },
    assignedTo: { type: Schema.Types.ObjectId, ref: "DoctorModel"},
    assignedDate: Date,

    paymentDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    razorpayOrderId: String,
  },
  { timestamps: true }
);

officeSchema.index({ location: "2dsphere" });
export const OfficeModel = mongoose.model("Office", officeSchema);

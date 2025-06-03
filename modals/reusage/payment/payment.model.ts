
import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId; // Who made the payment
  serviceType: string; // "doctor", "pharmacy", etc.
  serviceId: mongoose.Types.ObjectId; // ID of doctor, pharmacy, etc.
  amount: number;
  status: "pending" | "success" | "failed";
  paymentMethod: string;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: { type: String, required: true }, // Helps you identify type
    serviceId: { type: Schema.Types.ObjectId, required: true }, // ID of doctor/hospital/etc
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);

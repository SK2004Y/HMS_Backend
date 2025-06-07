// ✅ Step 1: Order Model - Handles payments from any user type (patient, etc.)
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  serviceType: string; // e.g. doctor, radiology, ambulance
  amount: number;
  paymentId: string;
  razorpayOrderId: string;
  status: "pending" | "success" | "failed";
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    serviceType: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    razorpayOrderId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

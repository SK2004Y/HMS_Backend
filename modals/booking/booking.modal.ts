import mongoose from "mongoose";

export interface IBooking {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  serviceType: string;
  serviceName: string;
  selectedFields: {
    roomType: string;
    mode: string;
    report: string;
  };
  breakdown: object;
  totalAmount: number;
  paymentStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paidAt: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    serviceType: String,
    serviceName: String,
    selectedFields: {
      roomType: String,
      mode: String,
      report: String,
    },
    breakdown: Object,
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

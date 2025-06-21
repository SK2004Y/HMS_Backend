// modals/otp.modal.ts
import mongoose from "mongoose";


export interface IOtp {
    mobile:string;
    otp:string;
    expiresAt:Date;
    verified:boolean;
}

const otpSchema = new mongoose.Schema<IOtp>(
  {
    mobile: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<IOtp>("OTP", otpSchema);

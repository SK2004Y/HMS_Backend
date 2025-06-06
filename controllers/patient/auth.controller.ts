import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import userModel, { IUser } from "../../modals/user_model";
import twilio from "twilio";
import { redis } from "../../utils/redis";
// import twilioClient from "../config/twilioClient"; // Your Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);



// -----------------------------
// 🔐 Generate JWT Token (1 month)
// -----------------------------
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "30d", // token valid for 30 days
  });
};

//twilio
export const sendOTP = async (req: Request, res: Response) => {
  const { phone, name } = req.body;
  if (!phone || !name) {
    return res.status(400).json({ message: "Phone and name are required" });
  }

  // Create or update user in DB
  let user = await userModel.findOne({ phone });
  if (!user) {
    user = await userModel.create({ name, phone, role: "patient" });
  }

  try {
    // Twilio Verify generates its own OTP behind the scenes.
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: phone, channel: "sms" });
    console.log("Verify SID:", verification.sid);
    return res.status(200).json({ message: "OTP sent via Twilio Verify" });

   
  } catch (err: any) {
    return res.status(500).json({ message: "Failed to send OTP", error: err });
  }



};

// controllers/patient/auth.controller.ts

export const verifyOTP = async (req: Request, res: Response) => {
    const { otp } = req.body;
    const phone = req.headers["x-phone"] as string;
  
    // if (!phone || !otp) {
    //   return res.status(400).json({ message: "Phone and OTP are required" });
    // }
  
    try {
      // Let Twilio Verify check the code
      console.log(`otp is `, otp);
      const verificationCheck = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({ to: phone, code: otp });

      if (verificationCheck.status !== "approved") {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // OTP is valid; find user
      const user = await userModel.findOne({ phone });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // After OTP is approved and you have `user`:
      const token = generateToken(user._id.toString());

      // Store session in Redis (so isAuthenticated sees it)
      await redis.set(user._id, JSON.stringify(user), "EX", 7 * 24 * 60 * 60); // 7 days

      // Set the cookie exactly as your loginUser flow does:
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // false in dev
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return user info to frontend
      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: "OTP verification failed", error: err });
    }
  };
  
  
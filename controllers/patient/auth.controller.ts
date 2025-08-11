import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import userModel, { IUser } from "../../modals/user_model";
import twilio from "twilio";
import { redis } from "../../utils/redis";
import { sendSMS } from "../../utils/smsgateway/sendSMS";
// import twilioClient from "../config/twilioClient"; // Your Twilio client setup




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
  try {
    const { phone } = req.body;
    console.log(`send otp phone is  hitted`,phone);

    if (!phone ) {
      return res.status(400).json({ message: "Phone and name are required" });
    }

    // Find or create user
    let user = await userModel.findOne({ phone });
    if (!user) {
      user = await userModel.create({ phone, role: "patient" });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Save OTP with expiry
    user.otp = otp.toString();;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await user.save();

    // Prepare SMS text
    const smsText = `Dear customer, your OTP for login is ${otp}. Please do not share this OTP with anyone. It is valid for 10 minutes. Regards YBLT Services Pvt Ltds`;

    // ✅ Call sendSMS safely
    const smsResult = await sendSMS(phone, smsText);
    console.log(`sms otp is ${otp}, smsResult:`, smsResult);

    if (!smsResult) {
      return res.status(500).json({ message: "Failed to send OTP via SMS" });
    }

    console.log(`your msg is `,otp);

    // Respond with success
    return res.status(200).json({
      success: true,
      message: `OTP sent to ${phone}`,
      otp, // ❗ for dev only
    });
  } catch (error: any) {
    console.error("OTP send error:", error.message);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};


// controllers/patient/auth.controller.ts



export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "7d",
  });
};


export const verifyOTP = async (req: Request, res: Response) => {
  try {
    console.log(`verify otp is hitted`);


    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const user = await userModel.findOne({ phone });

    console.log(`user is verify otp `, user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is correct
    console.log(`user otp is `, user.otp);
    console.log(`otp is `, otp);

    if (user.otp?.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (user.otpExpire && user.otpExpire < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }



    
    // ✅ OTP is valid – generate token
    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store session in Redis
    await redis.set(
      user._id.toString(),
      JSON.stringify(user),
      "EX",
      7 * 24 * 60 * 60
    ); // 7 days

    // Set cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

   const isProduction = process.env.NODE_ENV === "production";

   res.cookie("refreshToken", refreshToken, {
     httpOnly: true,
    
     sameSite: isProduction ? "none" : "lax",
     secure: isProduction,
   });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      accessToken: token,
      refreshToken: refreshToken, // Include refresh token in response
    });
  } catch (err: any) {
    console.error("OTP verification failed:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};
  
  
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import userModel, { IUser } from "../../modals/user_model";
import twilio from "twilio";
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

// -----------------------------
// ✅ 1. Send OTP to patient phone
// -----------------------------
export const sendOTP = async (req: Request, res: Response) => {
  const { phone, name } = req.body;

  if (!phone || !name) {
    return res.status(400).json({ message: "Phone and name are required" });
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`otp is `,otp);
  // Hash the OTP before storing in DB
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Set OTP expiry (5 minutes)
  const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

  // Check if user exists
  let user = await userModel.findOne({ phone });

  if (!user) {
    // If not, create new patient
    user = await userModel.create({ name, phone, role: "patient" });
  }

  // Save OTP + expiry to user
  user.otp = hashedOtp;
  user.otpExpire = otpExpire;
  await user.save();

  // Send OTP via Twilio (choose either SMS or WhatsApp)
  try {
   await twilioClient.verify.v2
      .services("VA3434802fedb2d44e921372d8da31472a")
      .verifications.create({ to: "+919027948867", channel: "sms" })
      .then((verification) => console.log(verification.sid));


    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err:any) {
    return res.status(500).json({ message: "Failed to send OTP", error: err });
  }
  
};






// Use your Verify Service SID here (from environment or config)
// const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || "";

// export const sendOTP = async (req: Request, res: Response) => {
//   const { phone, name } = req.body;

//   if (!phone || !name) {
//     return res.status(400).json({ message: "Phone and name are required" });
//   }

//   // Check if user exists, else create patient
//   let user = await userModel.findOne({ phone });
//   if (!user) {
//     user = await userModel.create({ name, phone, role: "patient" });
//   }

//   try {
//     // Send OTP via Twilio Verify API using Service SID
//     // const verification = await twilioClient.verify
//     //   .services(VERIFY_SERVICE_SID)
//     //   .verifications.create({ to: phone, channel: "sms" }); // channel can be 'sms' or 'whatsapp'


//     const res= await twilioClient.verify.v2
//       .services("VA3434802fedb2d44e921372d8da31472a")
//       .verifications.create({ to: "+919027948867", channel: "sms" })
//       .then((verification) => console.log(verification.sid));


//     return res
//       .status(200)
//       .json({ message: "OTP sent successfully", sid: verification.sid });
//   } catch (error) {
//     return res.status(500).json({ message: "Failed to send OTP", error });
//   }
// };




// -----------------------------
// ✅ 2. Verify OTP & Login
// -----------------------------
export const verifyOTP = async (req: Request, res: Response) => {
  const { otp} = req.body;
  const phone = req.headers["x-phone"] as string; // or get from req.body or req.query or JWT token

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP are required" });
  }

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP are required" });
  }

  // Include otp (and otpExpire) even though they are select: false
  const user = await userModel.findOne({ phone }).select("+otp +otpExpire");

  console.log("user is:", user);

 
  if (!user || !user.otp || !user.otpExpire) {
    return res.status(404).json({ message: "User or OTP not found" });
  }

  // Check OTP expiry
  if (user.otpExpire < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // Match OTP
  const hashedInputOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (user.otp !== hashedInputOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Clear OTP from DB after verification
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id.toString());

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
};

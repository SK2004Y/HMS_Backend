
//3rd correction

require("dotenv").config();

import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";

// Optional regex to validate email format
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// User interface with OTP fields added
export interface IUser extends Document {
  name?: string;
  phone: string;
  email?: string;
  password?: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  otp?: string;
  otpExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;

  comparePassword?: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
  getResetPasswordToken: () => string;
}

// Mongoose schema for the user
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Prevent duplicate index error for null
      validate: {
        validator: function (value: string) {
          return !value || emailRegexPattern.test(value); // Accept empty or valid email
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      select: false, // Don't return password by default
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "patient",
      enum: [
        "patient",
        "doctor",
        "gym",
        "diagnostic",
        "hospital",
        "medicine",
        "resort",
        "radiology",
        "ambulance",
        "admin",
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// 🔐 Encrypt password before saving, only if modified
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔐 Sign JWT Access Token (1 month expiry)
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN as string, {
    expiresIn: "30d", // 1 month
  });
};

// 🔐 Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN as string, {
    expiresIn: "90d",
  });
};

// 🔍 Compare entered password with hashed password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password!);
};

// 🔑 Generate password reset token and expiry
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = randomBytes(20).toString("hex");

  this.resetPasswordToken = createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  return resetToken;
};

// Export Mongoose model
const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;

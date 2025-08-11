


//2nd
require("dotenv").config();
import { Response } from "express";
import { IUser } from "../modals/user_model";
import { redis } from "./redis";

/**
 * Interface for token cookie options.
 */
interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

/**
 * Convert minutes to milliseconds.
 */
const toMs = (min: number) => min * 60 * 1000;

/**
 * Read expiration times from environment or use default fallback (in minutes).
 */
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "30", 10); // 30 minutes
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "14400",
  10
); // 10 days (14400 minutes)

/**
 * Define default options for access token cookie.
 */
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + toMs(accessTokenExpire)),
  maxAge: toMs(accessTokenExpire),
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" required for cross-site cookies
  secure: process.env.NODE_ENV === "production", // send cookie only over HTTPS in production
};

/**
 * Define default options for refresh token cookie.
 */
export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + toMs(refreshTokenExpire)),
  maxAge: toMs(refreshTokenExpire),
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // must be "none" for secure cross-origin cookie
  secure: process.env.NODE_ENV === "production",
};

/**
 * Generates access/refresh tokens, stores session in Redis,
 * sets cookies, and sends user with accessToken in response.
 */
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // Save user session in Redis (used later in access token refresh route)
  redis.set(user._id, JSON.stringify(user));

  // Set cookies
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // Respond with user and token
  res.status(statusCode).json({
    success: true,
    user,
    accessToken, // helpful for client state sync
  });
};





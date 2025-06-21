// controllers/otp/sendOtp.ts
import { Request, Response, NextFunction } from "express";
import { OTP } from "../../modals/ambulance.modal/otp.modal";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import ErrorHandler from "../../utils/ErrorHandler";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mobile } = req.body;

    if (!mobile)
      return next(new ErrorHandler("Mobile number is required", 400));

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    // Save or update OTP
    await OTP.findOneAndUpdate(
      { mobile },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // ⚠️ You can replace this with actual SMS API call
    console.log(`OTP for ${mobile}: ${otp}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${mobile}`,
    });
  }
);





//verfiy otp
export const verifyOtp = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { mobile, otp } = req.body;

  const record = await OTP.findOne({ mobile });

  if (!record)
    return next(new ErrorHandler("OTP not found for this number", 400));

  if (record.verified)
    return next(new ErrorHandler("OTP already verified", 400));

  if (record.expiresAt < new Date())
    return next(new ErrorHandler("OTP has expired", 400));

  if (record.otp !== otp)
    return next(new ErrorHandler("Invalid OTP", 400));

  record.verified = true;
  await record.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});

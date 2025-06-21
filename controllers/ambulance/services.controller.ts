import express, { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import ErrorHandler from "../../utils/ErrorHandler";
import { AmbulanceVehicle } from "../../modals/ambulance.modal/services.modal";
import { OTP } from "../../modals/ambulance.modal/otp.modal";



export const createAmbulanceVehicleService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("API hit: createAmbulanceVehicleService");
      console.log("Request Body:", req.body);

      // 🔐 Required field check
      const {
        type,
        subType,
        registrationNumber,
        insuranceFrom,
        insuranceTo,
        declarationAccepted,
        declarationDate,
        declarationPlace,
        mobile,
        otpVerified,
      } = req.body;

      if (!declarationAccepted) {
        return res.status(400).json({
          success: false,
          message: "Please accept the self-declaration before submitting.",
        });
      }

      // 🚫 Prevent duplicate registration numbers
      const existingVehicle = await AmbulanceVehicle.findOne({
        registrationNumber,
      });


      const otpRecord = await OTP.findOne({ mobile, verified: true });
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: "Mobile number not verified. Please verify OTP.",
        });
      }



      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle with this registration number already exists.",
        });
      }

      // 🛠 Create and save vehicle
      const vehicle = new AmbulanceVehicle({
        type,
        subType,
        registrationNumber,
        insuranceFrom,
        insuranceTo,
        declarationAccepted,
        declarationDate,
        declarationPlace,
        mobile,
        otpVerified,
      });

      await vehicle.save();

      res.status(201).json({
        success: true,
        vehicle,
        message: "Ambulance vehicle added successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

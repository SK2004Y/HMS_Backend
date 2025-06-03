import express, { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { DiagnosticProfile } from "../../modals/diagnosis.modal/diagnosisProfile.modal";
import { streamUploadToCloudinary } from "../../utils/cloudinary";

import ErrorHandler from "../../utils/ErrorHandler";
import { DoctorService } from "../../modals/doctor.modal/services.modal";
export const createDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("API hit: CreatedServices");
      console.log("Request Body:", req.body);
      console.log("File:", req.file);
      let avatarData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        avatarData = await streamUploadToCloudinary(req.file, "doctor-service");
      }

      const parsedBody = {
        ...req.body,
      };

      const doctor = new DoctorService({
        ...parsedBody,
        avatar: {
          url: avatarData.secure_url,
          public_id: avatarData.public_id,
        },
      });

      await doctor.save();

      res.status(201).json({
        success: true,
        doctor,
        message: "Services Created  successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



//get all servcies 
export const getAllDoctorServices = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
  

      
      const doctor = await DoctorService.find();
      res.status(201).json({
        success: true,
        Serviceslen:doctor.length,
        doctor,
        message: "Services Created  successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


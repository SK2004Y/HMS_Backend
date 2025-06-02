import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import {DiagnosticProfile } from "../../modals/diagnosis.modal/diagnosisProfile.modal";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import express,{NextFunction,Request,Response} from "express"
import ErrorHandler from "../../utils/ErrorHandler";
export const createDiagnosisProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("API hit: createDoctorProfile");
      console.log("Request Body:", req.body);
      console.log("File:", req.file);
      let avatarData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        avatarData = await streamUploadToCloudinary(req.file, "doctor-avatars");
      }
      let location = {};
      let accountDetails = {};

      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location data" });
      }

      try {
        accountDetails = JSON.parse(req.body.accountDetails);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid account details data" });
      }
      
      const parsedBody = {
        ...req.body,
        location,
        accountDetails,
      };
      const existingProfile = await DiagnosticProfile.findOne({
        userId: req.body.userId,
      });
      if (existingProfile) {
        return res
          .status(400)
          .json({ message: "Profile already exists for this user." });
      }
      const doctor = new DiagnosticProfile({
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
        message: "Profile Completed successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
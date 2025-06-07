import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { PatientProfile} from "../../modals/patient.modal/profile.modal";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import express,{NextFunction,Request,Response} from "express"
import ErrorHandler from "../../utils/ErrorHandler";

export const createPatientProfile = CatchAsyncError(
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
        avatarData = await streamUploadToCloudinary(req.file, "patient-avatars");
      }
      let location = {};
    

      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location data" });
      }

   
      
      const parsedBody = {
        ...req.body,
        location,
     
      };
      const existingProfile = await PatientProfile.findOne({
        userId: req.body.userId,
      });
      if (existingProfile) {
        return res
          .status(400)
          .json({ message: "Profile already exists for this user." });
      }
      const patient = new PatientProfile({
        ...parsedBody,
        avatar: {
          url: avatarData.secure_url,
          public_id: avatarData.public_id,
        },
      });

      await patient.save();

      res.status(201).json({
        success: true,
       patient,
        message: "Profile Completed successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);




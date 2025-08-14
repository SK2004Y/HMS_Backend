import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { GymProfile } from "../../modals/gym.modal.ts/profile.modal";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import express,{NextFunction,Request,Response} from "express"
import ErrorHandler from "../../utils/ErrorHandler";
import { GymService } from "../../modals/gym.modal.ts/services.modal";

export const createGymProfile = CatchAsyncError(
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
      const existingProfile = await GymProfile.findOne({
        userId: req.body.userId,
      });
      if (existingProfile) {
        return res
          .status(400)
          .json({ message: "Profile already exists for this user." });
      }
      const doctor = new GymProfile({
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



//Gym service creation
export const createGymService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("API hit: createGymService");
      console.log("Request Body:", req.body);
      console.log("File:", req.file);

      let imageData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        imageData = await streamUploadToCloudinary(req.file, "gym-services");
      }

      let pricing = {};
      let schedule = {};

      try {
        pricing = JSON.parse(req.body.pricing);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid pricing data" });
      }

      try {
        schedule = JSON.parse(req.body.schedule);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid schedule data" });
      }

      const parsedBody = {
        ...req.body,
        pricing,
        schedule,
      };

      const existingService = await GymService.findOne({
        serviceName: req.body.serviceName,
        userId: req.body.userId,
      });

      if (existingService) {
        return res
          .status(400)
          .json({ message: "This service already exists for this user." });
      }

      const service = new GymService({
        ...parsedBody,
        image: {
          url: imageData.secure_url,
          public_id: imageData.public_id,
        },
      });

      await service.save();

      res.status(201).json({
        success: true,
        service,
        message: "Gym service created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);





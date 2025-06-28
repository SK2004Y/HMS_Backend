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






//get patient 
// controllers/patientController.ts

export const getPatientProfileByUserId = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;


    console.log(`called `)
    const profile = await PatientProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  }
);



// controllers/patientController.ts
export const updatePatientProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileId = req.params.id;
      const existingProfile = await PatientProfile.findById(profileId);

      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      let avatarData = {
        secure_url: existingProfile.avatar?.url || "",
        public_id: existingProfile.avatar?.public_id || "",
      };

      // If new file uploaded, replace existing avatar in Cloudinary
      if (req.file) {
        // Optional: delete old avatar from cloudinary
        // await deleteFromCloudinary(existingProfile.avatar.public_id);

        avatarData = await streamUploadToCloudinary(req.file, "patient-avatars");
      }

      // Parse location safely if present
      let location = existingProfile.location;
      if (req.body.location) {
        try {
          location = JSON.parse(req.body.location);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid location data",
          });
        }
      }

      // Only allow updatable fields (skip DOB, for example)
      const updatableFields = {
        name: req.body.name,
        bloodGroup: req.body.bloodGroup,
        gender: req.body.gender,
        address: req.body.address,
        allergies: req.body.allergies,
        location,
        avatar: avatarData,
      };

      const updatedProfile = await PatientProfile.findByIdAndUpdate(
        profileId,
        updatableFields,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        updatedProfile,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

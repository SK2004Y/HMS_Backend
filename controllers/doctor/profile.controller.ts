import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { DoctorProfile } from "../../modals/doctor.modal/profile.modal";
import { deleteFromCloudinary, streamUploadToCloudinary } from "../../utils/cloudinary";
import ErrorHandler from "../../utils/ErrorHandler";
import express, {NextFunction,Request,Response} from "express"

export const createDoctorProfile = CatchAsyncError(
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
      const existingProfile = await DoctorProfile.findOne({
        userId: req.body.userId,
      });
      if (existingProfile) {
        return res
          .status(400)
          .json({ message: "Profile already exists for this user." });
      }
      const doctor = new DoctorProfile({
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
        message: "Profile created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const allDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      

      const doctor=await DoctorProfile.find();
      const len=doctor.length;
     

      // Step 3: Save doctor profile to MongoDB
    

      // Step 4: Respond with success and created profile
      res.status(201).json({ success: true,messagess:"total doctors are ",len, doctor });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


export const singleDoctorProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id=req.params.id
      console.log(`doctoridis `,id)
      const doctor = await DoctorProfile.findById(id);


      // Step 3: Save doctor profile to MongoDB

      // Step 4: Respond with success and created profile
      res
        .status(201)
        .json({ success: true, messagess: "Single doctor profile", doctor });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Controller to update doctor profile and optionally replace avatar
export const updateDoctorProfiles = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.params.id;
      const files=req.file;
      console.log(`fileis `,files)

      // Step 1: Find the existing doctor profile
      const existingDoctor = await DoctorProfile.findById(doctorId);
      if (!existingDoctor) {
        return next(new ErrorHandler("Doctor not found", 404));
      }

      // Step 2: Prepare updated avatar data
      let newAvatar = existingDoctor.avatar; // Default to existing avatar

      if (req.file) {
        // Step 3: Upload new avatar to Cloudinary
        const uploadedAvatar = await streamUploadToCloudinary(
          req.file,
          "doctor-avatars"
        );

        // Step 4: Delete old avatar from Cloudinary (if exists)
        if (existingDoctor.avatar?.public_id) {
          await deleteFromCloudinary(existingDoctor.avatar.public_id);
        }

        // Step 5: Set new avatar data
        newAvatar = {
          url: uploadedAvatar.secure_url,
          public_id: uploadedAvatar.public_id,
        };
      }

      // Step 6: Update doctor profile
      const updatedDoctor = await DoctorProfile.findByIdAndUpdate(
        doctorId,
        {
          ...req.body,
          avatar: newAvatar,
        },
        { new: true, runValidators: true }
      );

      // Step 7: Return updated profile
      res.status(200).json({ success: true, doctor: updatedDoctor });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
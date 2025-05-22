import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { Request,Response,NextFunction } from "express";
import { DoctorProfile } from "../../modals/doctor.modal/profile.modal";
import userModel from "../../modals/user_model";
import ErrorHandler from "../ErrorHandler";


export const handleProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      
        const { userIds, role } = req.query;
        console.log(`req userids ${userIds} and role is ${role}`);

        if (!userIds || !role)
          return res.status(400).json({ message: "Missing userId or role" });

        let profileExists = false;

        switch (role) {
          case "doctor":
            profileExists = (await DoctorProfile.findOne({ userId: userIds})) !== null;
            break;
          // Add cases for hospital, ambulance, etc.
        }

      // Step 4: Respond with success and created profile
      res.status(201).json({ success: true,profileCompleted:!!profileExists});
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
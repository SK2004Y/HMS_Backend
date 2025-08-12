import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { DoctorProfile } from "../../modals/doctor.modal/profile.modal";
import userModel from "../../modals/user_model";
import ErrorHandler from "../ErrorHandler";
import { GymProfile } from "../../modals/gym.modal.ts/profile.modal";
import { DiagnosticModel } from "../../modals/diagnostic.model";
import { RadiologyProfile } from "../../modals/radiology.modal.ts/profile.modal";
import { AmbulanceProfile } from "../../modals/ambulance.modal/profile.modal";
import { DiagnosticProfile } from "../../modals/diagnosis.modal/diagnosisProfile.modal";
import { HospitalProfile } from "../../modals/hospital.modal/profile.modal";
import { PatientProfile } from "../../modals/patient.modal/profile.modal";


export const handleProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`handleprofilehit `, req.query);
      const { userIds, role } = req.query;
      console.log(`req userids ${userIds} and role is ${role}`);

      if (!userIds || !role)
        return res.status(400).json({ message: "Missing userId or role" });

      let profileExists = false;

      switch (role) {
        case "patient":
          console.log(`idis before `);
          profileExists =
            (await PatientProfile.findOne({ userId: userIds })) !== null;
          console.log(`idis after `);
          break;
        case "doctor":
          console.log(`idis before `);
          profileExists =
            (await DoctorProfile.findOne({ userId: userIds })) !== null;
          console.log(`idis after `);
          break;
        case "gym":
          console.log(`idis gym `);
          profileExists =
            (await GymProfile.findOne({ userId: userIds })) !== null;
          break;
        case "diagnosis":
          profileExists =
            (await DiagnosticProfile.findOne({ userId: userIds })) !== null;
          break;
        case "hospital":
          profileExists =
            (await HospitalProfile.findOne({ userId: userIds })) !== null;
          break;

        case "radiology":
          profileExists =
            (await RadiologyProfile.findOne({ userId: userIds })) !== null;
          break;
        case "ambulance":
          profileExists =
            (await AmbulanceProfile.findOne({ userId: userIds })) !== null;
          break;

        case "resort":
          profileExists =
            (await RadiologyProfile.findOne({ userId: userIds })) !== null;
          break;
        // Add cases for hospital, ambulance, etc.
      }

      // Step 4: Respond with success and created profile
      res.status(201).json({ success: true, profileCompleted: !!profileExists });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



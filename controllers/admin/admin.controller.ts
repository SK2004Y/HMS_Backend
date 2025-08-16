// controllers/admin.controller.ts
import { Request, Response } from "express";
import userModel from "../../modals/user_model";
import { ResortService } from "../../modals/resort.modal/services.modal";
import { AmbulanceVehicle } from "../../modals/ambulance.modal/services.modal";
import { HospitalService } from "../../modals/hospital.modal/services.modal";
import { ClinicService } from "../../modals/clinic.modal/service.modal";
import { E_ClinicService } from "../../modals/e_clinic/service.modal";
import { GymService } from "../../modals/gym.modal.ts/services.modal";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import { DiagnosticService } from "../../modals/diagnosis.modal/services.modal";
import { WellnessTourService } from "../../modals/wellness/service.modal";
import { PathologyService } from "../../modals/pathology.modal/services.modal";
// Import all possible profile models
import { RadiologyProfile } from "../../modals/radiology.modal.ts/profile.modal";
import { ResortProfile } from "../../modals/resort.modal/profile.modal";
import { GymProfile } from "../../modals/gym.modal.ts/profile.modal";
import { AmbulanceProfile } from "../../modals/ambulance.modal/profile.modal";
// import { ProfessionalProfile } from "../../modals/professional.modal/service.modal";
import { AnyARecord } from "dns";
import { HospitalProfile } from "../../modals/hospital.modal/profile.modal";
// ... import other profile models as needed

// Map role → corresponding profile model
// const profileModelMap: Record<string, any> = {
//   radiology: RadiologyProfile,
//   ambulance: AmbulanceProfile,
//   gym: GymProfile,
//   resort: ResortProfile,

//   HospitalProfile,
//   //   professional: ProfessionalProfile,
//   // Add more here...
// };


// Map role → corresponding profile model
const profileModelMap: Record<string, any> = {
  radiology: RadiologyProfile,
  ambulance: AmbulanceProfile,
  gym: GymProfile,
  resort: ResortProfile,
  // Multiple roles using the same model
  clinic: HospitalProfile,
  e_clinic: HospitalProfile,
  professional: HospitalProfile,
  hospital: HospitalProfile,
};



/**
 * @desc   Get paginated list of all users with optional filters
 * @route  GET /api/admin/users
 * @access Admin
 */


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, search, isVerified } = req.query;

    const query: any = {};

    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await userModel
      .find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await userModel.countDocuments(query);
console.log(`users`, users);
    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
      
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};










//3rd
import { Types } from "mongoose"; // for ObjectId






// ✅ Approve User

//4th

export const getUserWithProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log("userId:", userId);

    // Step 1: Find the user (with timestamps included)
    const user = await userModel.findById(userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log("User found:", user.role);

    // Step 2: Map role to profile model
    const ProfileModel = profileModelMap[user.role.toLowerCase()];
    console.log("ProfileModel:", ProfileModel);

    let profile = null;
    if (ProfileModel) {
      // Convert userId to ObjectId for correct querying
      const objectUserId = Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : userId;
      profile = await ProfileModel.findOne({ userId: objectUserId }).lean();
    }

    console.log("Profile found:", profile);

    // Step 3: Respond with combined data including createdAt & updatedAt
    res.status(200).json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: profile
        ? {
            ...profile,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        : {},
    });
  } catch (error: any) {
    console.error("Error in getUserWithProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
















export const approveUser = async (req:Request, res:Response) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Approve User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ❌ Deapprove User
export const deapproveUser = async (req:Request, res:Response) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { isVerified: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deapproved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Deapprove User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🗑️ Delete User
// export const deleteUser = async (req:Request, res:Response) => {
//   try {
//     const { userId } = req.params;

//     const user = await userModel.findByIdAndDelete(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete User Error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };




// 🗑️ Delete User and All Their Services









export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Find and delete the user
    const user = await userModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Delete all services created by this user
    await Promise.all([
      PathologyService .deleteMany({ userId }),
      WellnessTourService.deleteMany({ userId }),
      DiagnosticService.deleteMany({ userId }),
       RadiologyService.deleteMany({ userId }),
       GymService.deleteMany({ userId }),
      E_ClinicService.deleteMany({ userId }),
      ClinicService.deleteMany({ userId }),
       HospitalService.deleteMany({ userId }),
       AmbulanceVehicle.deleteMany({ userId }),
      ResortService.deleteMany({ userId }),
    ]);

    res.status(200).json({
      success: true,
      message: "User and all related services deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

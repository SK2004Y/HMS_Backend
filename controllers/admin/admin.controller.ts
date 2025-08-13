// controllers/admin.controller.ts
import { Request, Response } from "express";
import userModel from "../../modals/user_model";

// Import all possible profile models
import { RadiologyProfile } from "../../modals/radiology.modal.ts/profile.modal";
import { ResortProfile } from "../../modals/resort.modal/profile.modal";
import { GymProfile } from "../../modals/gym.modal.ts/profile.modal";
import { AmbulanceProfile } from "../../modals/ambulance.modal/profile.modal";
// import { ProfessionalProfile } from "../../modals/professional.modal/service.modal";
import { AnyARecord } from "dns";
// ... import other profile models as needed

// Map role → corresponding profile model
const profileModelMap: Record<string, any> = {
  radiology: RadiologyProfile,
  ambulance: AmbulanceProfile,
  gym: GymProfile,
  resort: ResortProfile,
//   professional: ProfessionalProfile,
  // Add more here...
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




/**
 * @desc   Get user details + their completed profile based on role
 * @route  GET /api/admin/users/:userId
 * @access Admin
 */
export const getUserWithProfile = async (req:Request, res:Response) => {
  try {
    const { userId } = req.params;

    // Step 1: Find the user
    const user = await userModel.findById(userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Step 2: Find the profile model based on user's role
    const ProfileModel = profileModelMap[user.role];
    let profile = null;

    if (ProfileModel) {
      profile = await ProfileModel.findOne({ userId }).lean();
    }

    // Step 3: Respond with combined user + profile data
    res.status(200).json({
      success: true,
      user,
      profile: profile || {},
    });
  } catch (error:any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ✅ Approve User
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
export const deleteUser = async (req:Request, res:Response) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




// 🗑️ Delete User and All Their Services


// import RadiologyService from "../../modals/radiology.modal.ts/services.modal";
// import ambulanceModel from "../models/ambulanceModel";
// import diagnosisModel from "../models/diagnosisModel";
// import resortModel from "../models/resortModel";

// export const deleteUser = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;

//     // 1️⃣ Find and delete the user
//     const user = await userModel.findByIdAndDelete(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // 2️⃣ Delete all services created by this user
//     await Promise.all([
//       radiologyModel.deleteMany({ userId }),
//       ambulanceModel.deleteMany({ userId }),
//       diagnosisModel.deleteMany({ userId }),
//       resortModel.deleteMany({ userId }),
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "User and all related services deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete User Error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

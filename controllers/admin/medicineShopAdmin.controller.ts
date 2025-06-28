import { Request, Response, NextFunction } from "express";

import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import ErrorHandler from "../../utils/ErrorHandler";
import userModel from "../../modals/user_model"

import { ResortProfile } from "../../modals/resort.modal/profile.modal";
import { DiagnosticProfile } from "../../modals/diagnosis.modal/diagnosisProfile.modal";
import { AmbulanceProfile } from "../../modals/ambulance.modal/profile.modal";





























//adming for dashboard to see user all details 
// controllers/adminController.ts










//adming overview 

const profileModels = [
  { type: "resort", model: ResortProfile },
  { type: "diagnosis", model: DiagnosticProfile },
  { type: "ambulance", model: AmbulanceProfile },
];

export const getProfileTypeSummary = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, startDate, endDate } = req.query;

    // Optional name filter (user search)
    const userFilters: any = {};
    if (name) {
      userFilters.name = { $regex: name as string, $options: "i" };
    }

    // Optional date range
    if (startDate || endDate) {
      userFilters.createdAt = {};
      if (startDate) userFilters.createdAt.$gte = new Date(startDate as string);
      if (endDate) userFilters.createdAt.$lte = new Date(endDate as string);
    }

    // Fetch matched users
    const users = await userModel.find(userFilters).select("_id isVerified");

    const userMap = new Map<string, boolean>();
    users.forEach((user) => userMap.set(user._id.toString(), user.isVerified));

    const result = [];

    for (const { type, model } of profileModels) {
      const profiles = await model.find({});

      let total = 0;
      let verified = 0;
      let notVerified = 0;

      for (const profile of profiles) {
        const userId = profile.userId.toString();
        if (!userMap.has(userId)) continue;

        total++;
        if (userMap.get(userId)) {
          verified++;
        } else {
          notVerified++;
        }
      }

      result.push({
        profileType: type,
        total,
        verified,
        notVerified,
      });
    }

    res.status(200).json({
      success: true,
      summary: result,
    });
  }
);






//view services details 

export const getProfilesByTypeWithFilters = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      type,
      name,
      startDate,
      endDate,
      isVerified,
      page = "1",
      limit = "10",
    } = req.query;

    

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    let selectedType =
      typeof type === "object" && type !== null ? (type as any).type : type;

    if (!selectedType || !profileModels[selectedType as string]) {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    const Model = profileModels[selectedType as string];
    console.log(`invalid type received selectedtype `,selectedType);
    // Build user filter
    const userFilter: any = {};

    if (name) {
      userFilter.name = { $regex: name as string, $options: "i" };
    }
    if (startDate || endDate) {
      userFilter.createdAt = {};
      if (startDate) userFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) userFilter.createdAt.$lte = new Date(endDate as string);
    }
    if (isVerified !== undefined) {
      userFilter.isVerified = isVerified === "true";
    }

    // Find matching users
    const users = await userModel
      .find(userFilter)
      .select("_id name email isVerified");
    const userIdMap = new Map<string, any>();
    users.forEach((u) => userIdMap.set(u._id.toString(), u));

    // Fetch profiles
    const profiles = await Model.find({
      userId: { $in: users.map((u) => u._id) },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Model.countDocuments({
      userId: { $in: users.map((u) => u._id) },
    });

    const profilesWithUser = profiles.map((profile) => ({
      ...profile.toObject(),
      user: userIdMap.get(profile.userId.toString()),
    }));

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      profiles: profilesWithUser,
    });
  }
);



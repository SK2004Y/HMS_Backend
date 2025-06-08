import { Request, Response, NextFunction } from "express";
import Doctor from "../models/Doctor.model";
import Ambulance from "../models/Ambulance.model";
import Radiology from "../models/Radiology.model";
import Lab from "../models/Lab.model";
import Pharmacy from "../models/Pharmacy.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";

// Unified search controller
export const globalSearch = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.q as string;

    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i"); // case-insensitive regex

    // 1) Search across all models concurrently
    const [doctors, ambulances, radiologies, labs, pharmacies] =
      await Promise.all([
        Doctor.find({
          $or: [{ name: searchRegex }, { specialization: searchRegex }],
        }).limit(5),
        Ambulance.find({
          $or: [{ driverName: searchRegex }, { vehicleNumber: searchRegex }],
        }).limit(5),
        Radiology.find({ testName: searchRegex }).limit(5),
        Lab.find({ packageName: searchRegex }).limit(5),
        Pharmacy.find({
          $or: [{ medicineName: searchRegex }, { storeName: searchRegex }],
        }).limit(5),
      ]);

    // 2) Send back grouped result
    res.status(200).json({
      success: true,
      query,
      results: {
        doctors,
        ambulances,
        radiologies,
        labs,
        pharmacies,
      },
    });
  }
);

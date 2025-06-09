import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import ErrorHandler from "../ErrorHandler";
import express from "express";
import { Request, Response, NextFunction } from "express";
// routes/service.route.ts
// router.get("/services/nearby", searchNearbyServices);

// controllers/serviceController.ts









export const DoctorallServices = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
 
        const { lat, lng, maxDistanceKm = 10 } = req.query;
        const maxDistanceMeters = Number(maxDistanceKm) * 1000;

        if (!lat || !lng) {
          return res.status(400).json({ message: "Missing lat/lng" });
        }
  
        const results = await Service.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [lng, lat] },
              distanceField: "distance",
              maxDistance: 20000, // 20 km
              spherical: true,
            },
          },
          {
            $match: { isActive: true },
          },
          {
            $addFields: {
              distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
            },
          },
          {
            $project: {
              name: 1,
              specialty: 1,
              distanceInKm: 1,
            },
          },
          { $limit: 20 },
        ]);
 
      // Step 4: Respond with success and created profile
      res.json({ data: results});
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
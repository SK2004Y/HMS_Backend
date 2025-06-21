import ErrorHandler from "../../utils/ErrorHandler";
import express, { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import { PathologyService } from "../../modals/pathology.modal/services.modal";
import { HospitalService } from "../../modals/hospital.modal/services.modal";
import { ClinicService } from "../../modals/clinic.modal/service.modal";
import { TourDetail } from "../../modals/tour.modal/service.modal";
import { ResortService } from "../../modals/resort.modal/services.modal";

import { redis } from "../../utils/redis";
import mongoose from "mongoose";
import { ProfessionalService } from "../../modals/professional.modal/service.modal";
import { AmbulanceVehicle } from "../../modals/ambulance.modal/services.modal";






const SERVICE_MODELS: Record<string, any> = {
  radiology: RadiologyService,
  pathology: PathologyService,
  clinic:ClinicService,
  hospital:HospitalService,
  professional:ProfessionalService,
  resort:ResortService,
  ambulance:AmbulanceVehicle,
};


export const searchServicesByType= CatchAsyncError(
    async(
  req: Request,
  res: Response,
  next: NextFunction
) =>{
  try {
    const {
      q,
      lat,
      lng,
      page = "1",
      limit = "16",
      userId,
      serviceType,
    } = req.query;



    console.log(`search dashboard req.parmas ${userId} and serviceType ${serviceType}`)
    // Validate inputs
    if (!serviceType || typeof serviceType !== "string") {
      return res.status(400).json({ message: "Service type is required" });
    }

    const Model = SERVICE_MODELS[serviceType.toLowerCase()];
    if (!Model) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;
    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);

    const cacheKey = `${serviceType}:${searchTerm || "all"}:${lat || "0"}:${
      lng || "0"
    }:user${userId || "any"}:page${pageNum}:limit${limitNum}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    const basePipeline: any[] = [];

  

    if (userId) {
      basePipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(userId as string) },
      });
    }

    if (searchTerm) {
      basePipeline.push({
        $match: {
          $or: [
            { serviceName: { $regex: searchTerm, $options: "i" } },
            { category: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

   
  
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await Model.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    const paginatedPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];
    const results = await Model.aggregate(paginatedPipeline);

    console.log(`result it after query`,results)
    await redis.set(
      cacheKey,
      JSON.stringify({ services: results, total, totalPages, page: pageNum }),
      "EX",
      60 *5
    );

    return res.status(200).json({
      services: results,
      total,
      totalPages,
      page: pageNum,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Search Services Error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
})
  





export const updateServiceTypeandId=CatchAsyncError(
    async(req: Request, res: Response, next: NextFunction) =>{
    try {
      const { serviceType, serviceId } = req.params;

      const Model = SERVICE_MODELS[serviceType.toLowerCase()];
      if (!Model) return res.status(400).json({ message: "Invalid service type" });

      const updatedService = await Model.findByIdAndUpdate(
        serviceId,
        { $set: req.body },
        { new: true }
      );

      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      return res.status(200).json({ updatedService });
    } catch (error: any) {
      console.error("Error in update:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  });



  export const deleteServiceTypeandId = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { serviceType, serviceId } = req.params;

          const Model = SERVICE_MODELS[serviceType.toLowerCase()];
          if (!Model)
            return res.status(400).json({ message: "Invalid service type" });

          const deleted = await Model.findByIdAndDelete(serviceId);
          if (!deleted) {
            return res.status(404).json({ message: "Service not found" });
          }

          return res
            .status(200)
            .json({ message: "Service deleted successfully" });
        } catch (error: any) {
          console.error("Error in delete:", error);
          return next(new ErrorHandler(error.message, 500));
        }
    }
  );


  export const viewSingleServiceTypeandId = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { serviceType, serviceId } = req.params;

          if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
          }

          const Model = SERVICE_MODELS[serviceType.toLowerCase()];
          if (!Model) {
            return res.status(400).json({ message: "Invalid service type" });
          }

          const service = await Model.findById(serviceId);
          if (!service) {
            return res.status(404).json({ message: "Service not found" });
          }

          return res.status(200).json({ service });
        } catch (error: any) {
          console.error("Error in viewSingleService:", error);
          return next(new ErrorHandler(error.message, 500));
        }
    }
  );









  //toogle all services


export const toggleAvailability = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceType, serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return next(new ErrorHandler("Invalid service ID", 400));
    }

    const Model = SERVICE_MODELS[serviceType.toLowerCase()];
    if (!Model) return next(new ErrorHandler("Invalid service type", 400));

    const provider = await Model.findById(serviceId);
    if (!provider) return next(new ErrorHandler("Provider not found", 404));

    provider.isAvailable = !provider.isAvailable;
    await provider.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `${serviceType} (${provider._id}) is now ${
        provider.isAvailable ? "available" : "unavailable"
      }`,
      serviceId: provider._id,
      isAvailable: provider.isAvailable,
    });
  }
);


//approval
export const approveProvider = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceType, serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return next(new ErrorHandler("Invalid service ID", 400));
    }

    const Model = SERVICE_MODELS[serviceType.toLowerCase()];
    if (!Model) return next(new ErrorHandler("Invalid service type", 400));

    const provider = await Model.findById(serviceId);
    if (!provider) return next(new ErrorHandler("Provider not found", 404));

    provider.isApproved = true;
    await provider.save();

    res.status(200).json({
      success: true,
      message: `${serviceType} (${provider._id}) approved successfully`,
      provider,
    });
  }
);
  
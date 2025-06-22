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



  





//all services by servicesId and serviceType
export const getAllServicesQuery = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const userId = req.query.userId as string;
    const serviceType = req.query.serviceType as string;
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string;

    // Validate
    if (!serviceType || typeof serviceType !== "string") {
      return res.status(400).json({ message: "Service type is required" });
    }

    const Model = SERVICE_MODELS[serviceType.toLowerCase()];
    if (!Model) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    const filter: any = {};

    // Filter by userId
    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    // Filter by search on serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Filter by lastMonth date
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    const cacheKey = `${serviceType}:${search || "all"}:user${
      userId || "any"
    }:page${page}:limit${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    try {
      const services = await Model.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await Model.countDocuments(filter);

      // Cache result
      await redis.set(
        cacheKey,
        JSON.stringify({
          services,
          total,
          totalPages: Math.ceil(total / limit),
          page,
        }),
        "EX",
        60 * 60 * 3 // 3 hours
      );

      res.status(200).json({
        services,
        total,
        totalPages: Math.ceil(total / limit),
        page,
      });
    } catch (error) {
      console.error("Error in getAllServicesQuery:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);




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
  
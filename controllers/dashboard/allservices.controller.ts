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
        60*1 // 3 hours
      );

      console.log(`hitted query with `,services);

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




export const updateServiceTypeandId = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { serviceType, serviceId } = req.params;

    const Model = SERVICE_MODELS[serviceType.toLowerCase()];
    if (!Model) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    // Update the service in DB
    const updatedService = await Model.findByIdAndUpdate(serviceId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🧹 Clear Redis cache for all pages of this user & serviceType
    const userId = updatedService.userId?.toString();
    const pattern = `${serviceType}:*user${userId || "any"}:*`;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log("Deleted Redis cache keys:", keys);
      }
    } catch (err) {
      console.warn("Redis cache deletion error:", err);
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      updatedService,
    });
  }
);






export const viewSingleServiceTypeandId = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { serviceType, serviceId } = req.params;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }

      // ✅ Get Mongoose model from serviceType
      const Model = SERVICE_MODELS[serviceType.toLowerCase()];
      if (!Model) {
        return res.status(400).json({ message: "Invalid service type" });
      }

      // ✅ Check Redis cache
      const cacheKey = `view:${serviceType}:${serviceId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res
          .status(200)
          .json({ service: JSON.parse(cached), cached: true });
      }

      // ✅ Fetch from DB
      const service = await Model.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // ✅ Store in Redis
      await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 60); // 1 hour cache

      return res.status(200).json({ service });
    } catch (error: any) {
      console.error("❌ Error in viewSingleServiceTypeandId:", error);
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

        // 🧹 Clear Redis cache related to this serviceType and user
        const userId = deleted.userId?.toString();
        const pattern = `${serviceType}:*user${userId || "any"}:*`;

        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log("🗑️ Deleted cache keys after delete:", keys);
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


  export const toggleServiceField = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const { serviceType, serviceId, field } = req.params;

      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return next(new ErrorHandler("Invalid service ID", 400));
      }

      const Model = SERVICE_MODELS[serviceType.toLowerCase()];
      if (!Model) {
        return next(new ErrorHandler("Invalid service type", 400));
      }

      const allowedFields = ["isAvailable", "lead"];
      if (!allowedFields.includes(field)) {
        return next(new ErrorHandler("Invalid toggle field", 400));
      }

      const service = await Model.findById(serviceId);
      if (!service) {
        return next(new ErrorHandler("Service not found", 404));
      }

      // ✅ Toggle the field value
      service[field] = !service[field];
      await service.save({ validateBeforeSave: false });

      // ✅ Delete Redis cache (view cache specifically)
      const cacheKey = `view:${serviceType}:${serviceId}`;
      await redis.del(cacheKey);

      return res.status(200).json({
        success: true,
        message: `${field} toggled for ${serviceType} (${service._id})`,
        serviceId: service._id,
        [field]: service[field],
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
  
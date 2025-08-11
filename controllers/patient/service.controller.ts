import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { DoctorService } from "../../modals/doctor.modal/services.modal";
import { DiagnosticService } from "../../modals/diagnosis.modal/services.modal";
import { GymService } from "../../modals/gym.modal.ts/services.modal";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import { HospitalService } from "../../modals/hospital.modal/services.modal";
import { ResortService } from "../../modals/resort.modal/services.modal";
import {  AmbulanceVehicle } from "../../modals/ambulance.modal/services.modal";
import { PharmacyService } from "../../modals/medicine.modal/services.modal";
import { ClinicService } from "../../modals/clinic.modal/service.modal";
import ErrorHandler from "../../utils/ErrorHandler";
import express, { NextFunction, Request, Response } from "express";
import { redis } from "../../utils/redis";
import { PathologyService } from "../../modals/pathology.modal/services.modal";
import { ProfessionalService } from "../../modals/professional.modal/service.modal";
import bookingModal from "../../modals/booking/booking.modal";
//patient services get pay for it
export const SingleDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await DoctorService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);
//all doctor services without pagination for patient shows
export const AllDoctorServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    console.log(`all doctor services page hitted doctors`);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await DoctorService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await DoctorService.countDocuments(filter);

      res.status(200).json({
        services,
        title: "Doctor Services",
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);

// controllers/service.controller.ts

// ✅ Build $geoNear stage if coords are provided
const buildGeoNear = (lng: number, lat: number) => ({
  $geoNear: {
    near: { type: "Point", coordinates: [lng, lat] },
    distanceField: "distance",
    spherical: true,
    query: { isActive: true }, // Only include active services
  },
});

// ✅ Controller to get all services (active + top rated) with optional geolocation
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { lng, lat } = req.query;

    console.log(`getAllservices data is $ called`);

    // ✅ Use Geo only if valid coordinates are provided
    const useGeo =
      typeof lng === "string" &&
      typeof lat === "string" &&
      !isNaN(Number(lng)) &&
      !isNaN(Number(lat));
    const longitude = Number(lng);
    const latitude = Number(lat);

    // ✅ Construct Redis cache key based on query (geo or not)
    const cacheKey = useGeo
      ? `services:geo:${latitude}:${longitude}`
      : "services:all";

    // ✅ Try to fetch from Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData as string); // 👈 safely parse

      console.log(`redis fetch `,parsed.services.length);
      console.log(`redis fetch radiology `, parsed.services.radiologies);

      return res.status(200).json({
        success: true,
        total: parsed.services.length,
        services: parsed.services,
        source: "cache",
      });
    }

    // ✅ Build the MongoDB pipeline
    const buildPipeline = (geo: boolean) => {
      const pipeline: any[] = [];

      if (geo) {
        pipeline.push(buildGeoNear(longitude, latitude));
      } else {
        pipeline.push({ $match: { isAvailable: true } });
      }

      // pipeline.push({ $sort: { rating: -1 } });
      pipeline.push({ $limit: 18 });

      return pipeline;
    };

    // ✅ Parallel aggregation from all service models
    const [
      doctors,
      ambulances,
      diagnostics,
      radiologies,
      resorts,
      clinic,
      pathology,
      professional,
      hospital,
    ] = await Promise.all([
      DoctorService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "doctor" }))
      ),
      AmbulanceVehicle.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "ambulance" }))
      ),
      DiagnosticService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "diagnostic" }))
      ),
      RadiologyService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "radiology" }))
      ),
      ResortService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "resort" }))
      ),
      ClinicService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "clinic" }))
      ),
      PathologyService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "pathology" }))
      ),
      ProfessionalService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "professional" }))
      ),
      HospitalService.aggregate(buildPipeline(useGeo)).then((docs) =>
        docs.map((doc) => ({ ...doc, serviceType: "hospital" }))
      ),
    ]);


    console.log(`doctor length `,doctors.length);
    console.log(`radiology length `, radiologies.length);

    // ✅ Merge into one combined array
    const allServices = [
      ...doctors,
      ...ambulances,
      ...diagnostics,
      ...radiologies,
      ...resorts,
      ...clinic,
      ...pathology,
      ...professional,
      ...hospital,
    ];

    // ✅ Store in Redis cache with short TTL (e.g., 5 minutes)
    await redis.set(
      cacheKey,
      JSON.stringify({ services: allServices }),
      "EX",
      60 * 4
    );


    console.log(`getAllservices data is `,allServices);

    return res.status(200).json({
      success: true,
      total: allServices.length,
      services: allServices,
      source: "database",
    });
  } catch (err) {
    console.error("Error in getAllServices controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching services",
    });
  }
};












export async function searchServices(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, lat, lng } = req.query;

    console.log(`hitted searchServices with query:`, req.query);
    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;

    const pipeline: any[] = [];

    // If we have valid coordinates, add geoNear stage
    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);
    if (hasGeo) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distance",
          spherical: true,
        },
      });
    }

    // Always filter available services
    pipeline.push({ $match: { isAvailable: true } });

    // Text search filter
    if (searchTerm) {
      pipeline.push({
        $match: {
          $or: [
            { serviceName: { $regex: searchTerm, $options: "i" } },
            { specialty: { $regex: searchTerm, $options: "i" } },
          ],
        },
      });
    }

    // If geo search, compute distance in km and sort by proximity
    if (hasGeo) {
      pipeline.push({
        $addFields: {
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      });
      pipeline.push({ $sort: { distance: 1 } });
    }

    // Limit results
    pipeline.push({ $limit: 20 });

    const results = await DoctorService.aggregate(pipeline);
    return res.status(200).json({ data: results });
  } catch (error: any) {
    console.error("Search Services Error:", error);
    return next(new ErrorHandler(error.message, 400));
  }
}

//radiology services pages
export async function searchServicesRadiology(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, lat, lng, page = "1", limit = "16" } = req.query;

    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);

    // 🔐 Create a unique Redis key
    const cacheKey = `radiologyServices:${searchTerm || "all"}:${lat || "0"}:${lng || "0"
      }:page${pageNum}:limit${limitNum}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    // 🧱 Build pipeline
    const basePipeline: any[] = [];

    if (hasGeo) {
      basePipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distance",
          spherical: true,
        },
      });
    }

    basePipeline.push({ $match: { isAvailable: true } });

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

    if (hasGeo) {
      basePipeline.push({
        $addFields: {
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      });
      basePipeline.push({ $sort: { distance: 1 } });
    }

    // 🔢 Count total
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await RadiologyService.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    // 📦 Paginated data
    const paginatedPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];

    const results = await RadiologyService.aggregate(paginatedPipeline);

    // 🚀 Store in Redis for 4 hours
    await redis.set(
      cacheKey,
      JSON.stringify({
        services: results,
        total,
        totalPages,
        page: pageNum,
      }),
      "EX",
      60 * 60 * 4
    );

    return res.status(200).json({
      services: results,
      total,
      totalPages,
      page: pageNum,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Search Services Resort Error:", error);
    return next(new ErrorHandler(error.message, 400));
  }
}

//resort services
export async function searchServicesResort(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, lat, lng, page = "1", limit = "16" } = req.query;

    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);

    // 🔐 Create a unique Redis key
    const cacheKey = `resortServices:${searchTerm || "all"}:${lat || "0"}:${lng || "0"
      }:page${pageNum}:limit${limitNum}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    // 🧱 Build pipeline
    const basePipeline: any[] = [];

    if (hasGeo) {
      basePipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distance",
          spherical: true,
        },
      });
    }

    basePipeline.push({ $match: { isAvailable: true } });

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

    if (hasGeo) {
      basePipeline.push({
        $addFields: {
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      });
      basePipeline.push({ $sort: { distance: 1 } });
    }

    // 🔢 Count total
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await ResortService.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    // 📦 Paginated data
    const paginatedPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];

    const results = await ResortService.aggregate(paginatedPipeline);

    // 🚀 Store in Redis for 4 hours
    await redis.set(
      cacheKey,
      JSON.stringify({
        services: results,
        total,
        totalPages,
        page: pageNum,
      }),
      "EX",
      60 * 60 * 4 //4hours cache
    );

    return res.status(200).json({
      services: results,
      total,
      totalPages,
      page: pageNum,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Search Services Resort Error:", error);
    return next(new ErrorHandler(error.message, 400));
  }
}

//searchServicesClinic

export async function searchServicesClinic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, lat, lng, page = "1", limit = "16" } = req.query;

    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);

    // 🔐 Create a unique Redis key
    const cacheKey = `clinicServices:${searchTerm || "all"}:${lat || "0"}:${lng || "0"
      }:page${pageNum}:limit${limitNum}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    // 🧱 Build pipeline
    const basePipeline: any[] = [];

    if (hasGeo) {
      basePipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distance",
          spherical: true,
        },
      });
    }

    basePipeline.push({ $match: { isAvailable: true } });

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

    if (hasGeo) {
      basePipeline.push({
        $addFields: {
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      });
      basePipeline.push({ $sort: { distance: 1 } });
    }

    // 🔢 Count total
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await ClinicService.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    // 📦 Paginated data
    const paginatedPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];

    const results = await ClinicService.aggregate(paginatedPipeline);

    // 🚀 Store in Redis for 4 hours
    await redis.set(
      cacheKey,
      JSON.stringify({
        services: results,
        total,
        totalPages,
        page: pageNum,
      }),
      "EX",
      60 * 60 * 4
    );

    return res.status(200).json({
      services: results,
      total,
      totalPages,
      page: pageNum,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Search Services Resort Error:", error);
    return next(new ErrorHandler(error.message, 400));
  }
}

//professional
export async function searchServicesProfessional(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, lat, lng, page = "1", limit = "16" } = req.query;

    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);

    // 🔐 Create a unique Redis key
    const cacheKey = `professionalServices:${searchTerm || "all"}:${lat || "0"
      }:${lng || "0"}:page${pageNum}:limit${limitNum}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    // 🧱 Build pipeline
    const basePipeline: any[] = [];

    if (hasGeo) {
      basePipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distance",
          spherical: true,
        },
      });
    }

    basePipeline.push({ $match: { isAvailable: true } });

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

    if (hasGeo) {
      basePipeline.push({
        $addFields: {
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      });
      basePipeline.push({ $sort: { distance: 1 } });
    }

    // 🔢 Count total
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await ProfessionalService.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    // 📦 Paginated data
    const paginatedPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];

    const results = await ProfessionalService.aggregate(paginatedPipeline);

    // 🚀 Store in Redis for 4 hours
    await redis.set(
      cacheKey,
      JSON.stringify({
        services: results,
        total,
        totalPages,
        page: pageNum,
      }),
      "EX",
      60 * 60 * 4
    );

    return res.status(200).json({
      services: results,
      total,
      totalPages,
      page: pageNum,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Search Services Resort Error:", error);
    return next(new ErrorHandler(error.message, 400));
  }
}

//hospital
export async function searchServicesHospital(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { q, lat, lng, page = "1", limit = "16" } = req.query;

    const searchTerm = typeof q === "string" && q.trim() ? q.trim() : null;
    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const hasGeo =
      latNum != null && lngNum != null && !isNaN(latNum) && !isNaN(lngNum);

    // 🔐 Create a unique Redis key
    const cacheKey = `hospitalServices:${searchTerm || "all"}:${lat || "0"}:${lng || "0"
      }:page${pageNum}:limit${limitNum}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ ...parsed, cached: true });
    }

    // 🧱 Build pipeline
    const basePipeline: any[] = [];

    if (hasGeo) {
      basePipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lngNum, latNum] },
          distanceField: "distance",
          spherical: true,
        },
      });
    }

    basePipeline.push({ $match: { isAvailable: true } });

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

    if (hasGeo) {
      basePipeline.push({
        $addFields: {
          distanceInKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      });
      basePipeline.push({ $sort: { distance: 1 } });
    }

    // 🔢 Count total
    const countPipeline = [...basePipeline, { $count: "total" }];
    const countResult = await HospitalService.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    // 📦 Paginated data
    const paginatedPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];

    const results = await HospitalService.aggregate(paginatedPipeline);

    // 🚀 Store in Redis for 4 hours
    await redis.set(
      cacheKey,
      JSON.stringify({
        services: results,
        total,
        totalPages,
        page: pageNum,
      }),
      "EX",
      60 * 60 * 4
    );

    return res.status(200).json({
      services: results,
      total,
      totalPages,
      page: pageNum,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Search Services Resort Error:", error);
    return next(new ErrorHandler(error.message, 400));
  }
}

//view all services

// controller/serviceView.ts

export const getServiceByTypeAndId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceType, id } = req.params;

    console.log(`getservices hitted`, serviceType, id);

    // 🔑 Generate unique Redis key
    const cacheKey = `service:${serviceType}:${id}`;

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 If not in cache, fetch from DB
    let service;
    switch (serviceType) {
      case "doctor":
        service = await DoctorService.findById(id);
        break;
      case "radiology":
        service = await RadiologyService.findById(id);
        break;
      case "resort":
        service = await ResortService.findById(id);
        break;
      case "clinic":
        service = await ClinicService.findById(id);
        break;
      case "hospital":
        service = await HospitalService.findById(id);
        break;
      case "professional":
        service = await ProfessionalService.findById(id);
        break;
      case "pathology":
        service = await PathologyService.findById(id);
        break;
      case "ambulance":
        service = await AmbulanceService.findById(id);
        break;
      default:
        return next(new ErrorHandler("Invalid service type", 400));
    }

    if (!service) return next(new ErrorHandler("Service not found", 404));

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 60 * 4);

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};















//mobile individuals services query

export const AllClinic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_clinic_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await ClinicService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 *  10); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};



//diagnostic services
export const AllDiagnostic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_diagnostic_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await DiagnosticService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 20); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};



//resort services
export const AllResort = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_resort_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await ResortService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 20); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

//Radiology services
export const AllRadiology = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_Radiology_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await RadiologyService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 20); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};




//Pathology services
export const AllPathology= async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_pathology_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await PathologyService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 20); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};


//practitioner services
export const AllPractitioner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_practitioner_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await ProfessionalService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 20); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};



//pharmacy services
export const AllPharmacy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cacheKey = "all_pharmacy_services";

    // ✅ Check Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        service: JSON.parse(cached),
        cached: true,
      });
    }

    // 🔎 Fetch from DB
    const service = await PharmacyService.find();

    if (!service || service.length === 0) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // 💾 Store in Redis for 4 hours
    await redis.set(cacheKey, JSON.stringify(service), "EX", 60 * 20); //20mint

    res.status(200).json({ success: true, service, cached: false });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};





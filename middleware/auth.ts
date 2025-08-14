



// auth.ts
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import exp from "constants";
import userModel from "../modals/user_model";
import { RadiologyService } from "../modals/radiology.modal.ts/services.modal";
//2nd
// import { ClinicService } from "../modals/clinic.modal/service.modal";

import { ResortService } from "../modals/resort.modal/services.modal";
import { AmbulanceVehicle } from "../modals/ambulance.modal/services.modal";

import { DiagnosticService } from "../modals/diagnosis.modal/services.modal";

export const isAuthneticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    const access_token = req.cookies['access_token'] as string ;
    console.log("Cookies:", req.cookies);
    console.log("accesstoken:", access_token);



    // const access_token_cookie = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('access_token='));
    // const access_token = access_token_cookie ? access_token_cookie.split('=')[1] : undefined;
    // console.log("Cookies:", req.headers.cookie);
    // console.log("accesstoken:", access_token);
    // const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    try {
      const decode = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;

      if (!decode) {
        return next(new ErrorHandler("access token is not valid  ", 400));
      }

      const user = await redis.get(decode.id);
      if (!user) {
        return next(new ErrorHandler("Please login to access this resource", 400));
      }

      req.user = JSON.parse(user);
      next();
    } catch (error:any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);



// validate user route
export const authorizeRoles= (...roles:string[])=>{
  return(req:Request,res:Response,next:NextFunction)=>{
    if(!roles.includes(req.user?.role || '')){
      return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource `,403));
    }
    next();
  }
}



export const isVerifiedProvider = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource `,
          403
        )
      );
    }
    next();
  };
};



export const checkIsVerified = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Refresh the user from DB to ensure latest data is used
    const updatedUser = await userModel.findById(req.user._id).select(
      "isVerified role"
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("Freshly fetched user isVerified:", updatedUser.isVerified);
    console.log("User role:", updatedUser.role);

    if (!updatedUser.isVerified) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Account not verified. Please wait for a few hours.",
        });
    }

    // Attach the refreshed user to req.user so downstream middleware uses latest data
    req.user = updatedUser;
    next();
  }
);



//booking stats 
// Controller for Step 1, 2, 3 using req.user._id from isAuthenticated middleware

import Booking from "../modals/booking/booking.modal"; // Example booking model
import { ClinicService } from "../modals/clinic.modal/service.modal";
import { HospitalService } from "../modals/hospital.modal/services.modal";
import { PathologyService } from "../modals/pathology.modal/services.modal";
import { E_ClinicService } from "../modals/e_clinic/service.modal";
import { TourService } from "../modals/tour.modal/service.modal";
import { ProfessionalService } from "../modals/professional.modal/service.modal";
import { PharmacyServices } from "../modals/pharmacy/service.modal";




// Map role to related service models
const roleServiceMap = {

  radiology:[RadiologyService],
  ambulance: [AmbulanceVehicle],
  resort: [ResortService],
  diagnosis: [DiagnosticService],
  clinic: [ClinicService],
  hospital:[HospitalService],
  pathology:[PathologyService],
  e_clinic:[E_ClinicService],
  wellness:[TourService],
  professional:[ProfessionalService],
  pharmacy:[PharmacyServices],
  
  
};








//2nd 
export const getServiceProviderStatS = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceProviderId = req.user?._id?.toString();
      if (!serviceProviderId)
        return next(new ErrorHandler("Unauthorized", 401));
      const role = (req.user?.role || "").toString();

      // pagination + filters
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);
      const skip = (page - 1) * limit;
      const search = (req.query.search || "").toString().trim();
      const startDateRaw = req.query.startDate?.toString();
      const endDateRaw = req.query.endDate?.toString();

      // Build date filter for bookings (support start / end / both)
      const dateFilter: any = {};
      if (startDateRaw || endDateRaw) {
        dateFilter.createdAt = {};
        if (startDateRaw) dateFilter.createdAt.$gte = new Date(startDateRaw);
        if (endDateRaw) dateFilter.createdAt.$lte = new Date(endDateRaw);
      }

      console.log(`ServiceProvider ID: ${serviceProviderId}`);
      console.log(`Role: ${role}`);
      console.log(`Query params:`, req.query);

      const Models = roleServiceMap[role] || [];
      if (!Array.isArray(Models) || Models.length === 0) {
        return res
          .status(200)
          .json({
            success: true,
            services: [],
            totalServices: 0,
            growthPercentage: "0.00",
          });
      }

      // fields to try for display name / search (ordered by preference)
      const displayFields = [
        "serviceName",
        "medicineName",
        "name",
        "title",
        "type",
        "subType",
        "vehicleType",
        "registrationNumber",
        "serviceType",
      ];

      // Helper to compute a safe display name for any service document
      const getServiceDisplayName = (svc: any) => {
        for (const f of displayFields) {
          const val = svc?.[f];
          if (typeof val === "string" && val.trim() !== "") return val.trim();
        }
        // last resort: use _id
        return svc?._id?.toString() || "Unknown Service";
      };

      // Build services list by iterating models available to this role
      let services: any[] = [];
      for (const Model of Models) {
        // base query by owner
        const q: any = { userId: serviceProviderId };

        // if search provided, match against multiple possible name fields using $or
        if (search) {
          const or = displayFields.map((f) => ({
            [f]: { $regex: search, $options: "i" },
          }));
          q.$or = or;
        }

        // If Model has its own createdAt filtering requirement for listing services, you can add it here
        const data = await Model.find(q).lean();
        console.log(
          `Fetched ${data.length} services from ${Model.collection.name}`
        );
        services = services.concat(data || []);
      }

      const totalServices = services.length;
      const serviceIds = services.map((s) => s._id).filter(Boolean);
      console.log(`Total services: ${totalServices}`);
      console.log(`Service IDs:`, serviceIds);
      console.log(`Date filter applied (for bookings):`, dateFilter);

      // Aggregate bookings for these services (if there are no services, skip aggregation)
      let bookings: any[] = [];
      if (serviceIds.length > 0) {
        const match: any = { service: { $in: serviceIds } };
        if (dateFilter.createdAt) match.createdAt = dateFilter.createdAt;

        bookings = await Booking.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$service",
              totalBooked: { $sum: 1 },
              paymentPending: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
              },
              paymentSuccess: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "success"] }, 1, 0] },
              },
            },
          },
        ]).exec();
      }

      console.log(`Booking aggregation result:`, bookings);

      // create a map for quicker lookup
      const bookingMap = new Map<string, any>();
      bookings.forEach((b) => bookingMap.set(String(b._id), b));

      // combine data with safe displayName fallback
      const combinedData = services.map((svc) => {
        const idStr = String(svc._id);
        const booking = bookingMap.get(idStr);
        return {
          serviceId: svc._id,
          serviceName: getServiceDisplayName(svc),
          createdAt: svc.createdAt,
          totalBooked: booking ? booking.totalBooked : 0,
          paymentPending: booking ? booking.paymentPending : 0,
          paymentSuccess: booking ? booking.paymentSuccess : 0,
          // include raw service object if caller needs it (careful with size)
          // serviceRaw: svc,
        };
      });

      console.log(`Combined data:`, combinedData);

      // Growth: compare bookings in current month vs previous month (safe logic)
      const now = new Date();
      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const startOfPreviousMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const currentMonthFilter: any = {
        service: { $in: serviceIds },
        createdAt: { $gte: startOfCurrentMonth },
      };
      const previousMonthFilter: any = {
        service: { $in: serviceIds },
        createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth },
      };

      const [currentMonthBookings, previousMonthBookings] = await Promise.all([
        Booking.countDocuments(
          serviceIds.length ? currentMonthFilter : { _id: null }
        ),
        Booking.countDocuments(
          serviceIds.length ? previousMonthFilter : { _id: null }
        ),
      ]);

      console.log(`Current month bookings: ${currentMonthBookings}`);
      console.log(`Previous month bookings: ${previousMonthBookings}`);

      let growth = 0;
      if (previousMonthBookings === 0) {
        growth = currentMonthBookings === 0 ? 0 : 100;
      } else {
        growth =
          ((currentMonthBookings - previousMonthBookings) /
            previousMonthBookings) *
          100;
      }

      // pagination
      const pageData = combinedData.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        services: pageData,
        totalServices,
        page,
        limit,
        growthPercentage: growth.toFixed(2),
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message || "Server error", 500));
    }
  }
);



export const getTotalServices = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const serviceProviderId = req.user._id;
    const role = req.user.role;

    if (!roleServiceMap[role]) {
      return res.status(400).json({
        success: false,
        message: `No services found for role: ${role}`,
      });
    }

    let totalServices = 0;

    // Iterate through models for this role and count services
    for (const Model of roleServiceMap[role]) {
      const count = await Model.countDocuments({
        userId: serviceProviderId,
      });
      totalServices += count;
    }

    res.status(200).json({
      success: true,
      totalServices,
    });
  }
);
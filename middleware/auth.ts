



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




// Map role to related service models
const roleServiceMap = {

  radiology:[RadiologyService],
  ambulance: [AmbulanceVehicle],
  resort: [ResortService],
  diagnosis: [DiagnosticService],
  clinic: [ClinicService],
  hospital:[HospitalService],
  pathology:[PathologyService],
  
};




//get service provider stats
export const getServiceProviderStatS = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const serviceProviderId = req.user._id.toString();
    const role = req.user.role;
    const { page = 1, limit = 10, startDate, endDate, search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    console.log(`ServiceProvider ID: ${serviceProviderId}`);
    console.log(`Role: ${role}`);
    console.log(`Query params:`, req.query);

    // Fetch services
    let services: any[] = [];
    for (const Model of roleServiceMap[role]) {
      const query: any = { userId: serviceProviderId };
      if (search) {
        query.serviceName = { $regex: search, $options: "i" };
      }
      const data = await Model.find(query);
      console.log(
        `Fetched ${data.length} services from ${Model.collection.name}`
      );
      services = services.concat(data);
    }

    const totalServices = services.length;
    const serviceIds = services.map((s) => s._id);
    console.log(`Total services: ${totalServices}`);
    console.log(`Service IDs:`, serviceIds);
    console.log(`Date filter applied:`, dateFilter);

    // Aggregate bookings
    const bookings = await Booking.aggregate([
      { $match: { service: { $in: serviceIds }, ...dateFilter } },
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
    ]);
    console.log(`Booking aggregation result:`, bookings);

    // Merge stats
    const combinedData = services.map((service) => {
      const booking = bookings.find((b) => b._id.equals(service._id));
      return {
        serviceId: service._id,
        serviceName: service.serviceName,
        totalBooked: booking ? booking.totalBooked : 0,
        paymentPending: booking ? booking.paymentPending : 0,
        paymentSuccess: booking ? booking.paymentSuccess : 0,
      };
    });
    console.log(`Combined data:`, combinedData);

    // Calculate growth
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const currentMonthBookings = await Booking.countDocuments({
      service: { $in: serviceIds },
      createdAt: { $gte: startOfCurrentMonth },
    });
    const previousMonthBookings = await Booking.countDocuments({
      service: { $in: serviceIds },
      createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth },
    });

    console.log(`Current month bookings: ${currentMonthBookings}`);
    console.log(`Previous month bookings: ${previousMonthBookings}`);

    const growth =
      previousMonthBookings === 0
        ? 100
        : ((currentMonthBookings - previousMonthBookings) /
            previousMonthBookings) *
          100;

    console.log(`Growth percentage: ${growth}`);

    res.status(200).json({
      success: true,
      services: combinedData.slice(skip, skip + Number(limit)),
      totalServices,
      growthPercentage: growth.toFixed(2),
    });
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
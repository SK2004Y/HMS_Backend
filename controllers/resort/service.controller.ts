import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { streamUploadMultipleToCloudinary } from "../../utils/cloudinary";
import { ResortService } from "../../modals/resort.modal/services.modal";
import ErrorHandler from "../../utils/ErrorHandler";
import { TourService } from "../../modals/tour.modal/service.modal";

// Create Resort Service Controller
export const createResortService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];

      // Upload files to Cloudinary (both images & videos)
      const folder = "resort";
      const { images, videos } = await streamUploadMultipleToCloudinary(
        files,
        folder
      );

      // Handle images (default empty if none provided)
      let imageData = { url: "", public_id: "" };
      if (images?.length > 0) {
        imageData = {
          url: images[0].secure_url,
          public_id: images[0].public_id,
        };
      }

      // Handle videos (default empty if none provided)
      let videoData = { url: "", public_id: "" };
      if (videos?.length > 0) {
        videoData = {
          url: videos[0].secure_url,
          public_id: videos[0].public_id,
        };
      }

      // Handle optional location parsing
      let location = undefined;
      if (req.body.location) {
        try {
          const parsed = JSON.parse(req.body.location);

          const lon = parseFloat(parsed.coordinates?.[0]);
          const lat = parseFloat(parsed.coordinates?.[1]);

          // Only set if valid numbers
          if (!isNaN(lon) && !isNaN(lat)) {
            location = {
              type: "Point",
              coordinates: [lon, lat],
              city: parsed.city || "",
              state: parsed.state || "",
              pincode: parsed.pincode || "",
              landmark: parsed.landmark || "",
            };
          }
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid location format (must be JSON with coordinates).",
          });
        }
      }

      console.log("Received resort service data:", req.body);

      // Build the final document to store
      const parsedBody = {
        ...req.body,
        location, // either valid object or undefined
        image: imageData,
        video: videoData,
      };

      // Create and save the ResortService document
      const resortService = new ResortService(parsedBody);
      await resortService.save();

      res.status(201).json({
        success: true,
        resortService,
        message: "Resort service created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);





//tour operator services

// Create Resort Service Controller
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { TourService } from "../../modals/resort.modal/service.modal";
import ErrorHandler from "../../utils/ErrorHandler";

export const createTourService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Received TourOperator service data:", req.body);

      // Helper to safely parse if it's a string
      const safeParse = <T>(val: any): T => {
        if (typeof val === "string") return JSON.parse(val) as T;
        return val as T;
      };

      // Rebuild each nested field properly
      const details = safeParse<typeof req.body.details>(req.body.details);
      const reporting = safeParse<typeof req.body.reporting>(
        req.body.reporting
      );
      const ending = safeParse<typeof req.body.ending>(req.body.ending);
      const includes = safeParse<string[]>(req.body.includes);
      const optionalServices = safeParse<any[]>(req.body.optionalServices);

      // If you have a location field, do similar parsing:
      // const location = safeParse<LocationType>(req.body.location);

      // Build the document
      const parsedBody = {
        userId: req.body.userId,
        category: req.body.category,
        serviceName: req.body.serviceName,
        details, // now an array of objects
        maxSize: req.body.maxSize,
        ageRange: safeParse(req.body.ageRange),
        gender: safeParse(req.body.gender),
        reporting, // object with date, time, place
        ending, // object with date, time, place
        motive: req.body.motive,
        includes, // array of strings
        totalDays: req.body.totalDays,
        totalNights: req.body.totalNights,
        price: req.body.price,
        optionalServices, // array of { name, charge }
        description: req.body.description,
        // location,       // if applicable
      };

      const tour = new TourService(parsedBody);
      await tour.save();

      return res.status(201).json({
        success: true,
        tour,
        message: "Tour service created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

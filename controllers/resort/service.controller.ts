import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { streamUploadMultipleToCloudinary } from "../../utils/cloudinary";
import { ResortService } from "../../modals/resort.modal/services.modal";
import ErrorHandler from "../../utils/ErrorHandler";

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

      // Prepare image data
      let imageData = { url: "", public_id: "" };
      if (images?.length > 0) {
        imageData = {
          url: images[0].url,
          public_id: images[0].public_id,
        };
      }

      // Prepare video data
      let videoData = { url: "", public_id: "" };
      if (videos?.length > 0) {
        videoData = {
          url: videos[0].url,
          public_id: videos[0].public_id,
        };
      }

      // Parse location if provided
      let location: any = undefined;
      if (req.body.location) {
        try {
          const parsed = JSON.parse(req.body.location);

          const lon = parseFloat(parsed.coordinates?.[0]);
          const lat = parseFloat(parsed.coordinates?.[1]);

          if (!isNaN(lon) && !isNaN(lat)) {
            location = {
              type: "Point",
              coordinates: [lon, lat],
              city: parsed.city || "",
              state: parsed.state || "",
              pincode: parsed.pincode || "",
              landmark: parsed.landmark || "",
            };
          } else {
            console.warn("Invalid longitude/latitude. Skipping location.");
          }
        } catch (err) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid location format. Must be JSON with valid coordinates.",
          });
        }
      }

      console.log("Received resort service data:", req.body);

      // Construct the final payload safely
      const parsedBody = {
        ...req.body,
        ...(location && { location }), // include only if valid
        image: imageData,
        video: videoData,
      };

      // Save to DB
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

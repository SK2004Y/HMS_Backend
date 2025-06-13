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

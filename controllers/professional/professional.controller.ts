import express, { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import {
  streamUploadMultipleToCloudinary,
  streamUploadToCloudinary,
} from "../../utils/cloudinary";
import { ProfessionalService } from "../../modals/professional.modal/service.modal";
import ErrorHandler from "../../utils/ErrorHandler";

export const createProfessionalService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`clinic body data `, req.body);
      const files = req.files as Express.Multer.File[];
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

      const folder = "clinic";
      const { images } = await streamUploadMultipleToCloudinary(files, folder);

      // ✅ You likely uploaded multiple images, so check if it's an array
      let imageData = { url: "", public_id: "" };
      if (images.length > 0) {
        imageData = {
          url: images[0].url, // take the first one (if only one expected)
          public_id: images[0].public_id,
        };
      }

      // ✅ Safely parse location JSON

      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location data" });
      }

      // ✅ Prepare and save to DB
      const parsedBody = {
        ...req.body,
        location,
        image: imageData, // ✅ store the uploaded image info
      };

      const professionalService = new ProfessionalService(parsedBody);
      await professionalService.save();

      res.status(201).json({
        success: true,
        professionalService,
        message: " service created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

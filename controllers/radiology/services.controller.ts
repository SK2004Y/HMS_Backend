import express, { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import ErrorHandler from "../../utils/ErrorHandler";

export const createRadiologyService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`Radiology services hit with:`, req.body);

      const parsedReports = JSON.parse(req.body.reports).map((report: any) => ({
        reportsname: report.reportsname,
        courierFee: Number(report.courierFee),
        personFee: Number(report.personFee),
      }));


      req.body.reports = parsedReports;

      let avatarData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        avatarData = await streamUploadToCloudinary(
          req.file,
          "radiology-service"
        );
      }

      // ✅ Parse and validate location
      let location;
      try {
        const parsedLocation = JSON.parse(req.body.location || "{}");

        const longitude = parseFloat(parsedLocation.coordinates?.[0]);
        const latitude = parseFloat(parsedLocation.coordinates?.[1]);

        const isValidCoordinates =
          !isNaN(longitude) &&
          !isNaN(latitude) &&
          Math.abs(latitude) <= 90 &&
          Math.abs(longitude) <= 180;

        location = {
          type: "Point",
          coordinates: isValidCoordinates ? [longitude, latitude] : [0, 0],
          city: parsedLocation.city || "",
          state: parsedLocation.state || "",
          pincode: parsedLocation.pincode || "",
          landmark: parsedLocation.landmark || "",
        };
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location format" });
      }

      const parsedBody = {
        ...req.body,
        location,
      };

      const radiology = new RadiologyService({
        ...parsedBody,
        image: {
          url: avatarData.secure_url,
          public_id: avatarData.public_id,
        },
      });

      await radiology.save();

      res.status(201).json({
        success: true,
        radiology,
        message: "Service created successfully",
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message || "Service creation failed", 400)
      );
    }
  }
);

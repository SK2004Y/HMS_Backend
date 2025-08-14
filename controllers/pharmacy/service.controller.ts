// controllers/pharmacyService.controller.ts
import { Request, Response, NextFunction } from "express";
import { PharmacyServices } from "../../modals/pharmacy/service.modal";
import ErrorHandler from "../../utils/ErrorHandler";
import {CatchAsyncError} from "../../middleware/catchAsyncErrors";
import { streamUploadMultipleToCloudinary } from "../../utils/cloudinary";


//pharmacy router in clinic route
//create pharmacy service
export const createPharmacyService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id?.toString() ?? req.body.userId;
      if (!userId) return next(new ErrorHandler("userId is required", 400));

      const files = (req.files as Express.Multer.File[]) || [];
      const { images } = await streamUploadMultipleToCloudinary(
        files,
        "pharmacy"
      );
      const imageData = (images || []).map((img: any) => ({
        url: img.url,
        public_id: img.public_id,
      }));

      const parseJSON = <T>(val: any, fallback: T): T => {
        if (val == null || val === "") return fallback;
        if (typeof val === "string") {
          try {
            return JSON.parse(val) as T;
          } catch {
            return fallback;
          }
        }
        return val as T;
      };

      const compositionArr = parseJSON<any[]>(req.body.composition, []);
      const suppliedAsArr = parseJSON<string[]>(req.body.suppliedAs, []);

      // Build location only if valid coordinates provided (accept either location JSON or coordinates array)
      let location: any;
      const rawLoc = req.body.location
        ? parseJSON<any>(req.body.location, null)
        : null;
      const coords = rawLoc?.coordinates ?? req.body.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        const lon = Number(coords[0]);
        const lat = Number(coords[1]);
        if (Number.isFinite(lon) && Number.isFinite(lat)) {
          location = {
            type: "Point",
            coordinates: [lon, lat] as [number, number],
            city: rawLoc?.city ?? req.body.city ?? "",
            state: rawLoc?.state ?? req.body.state ?? "",
            pincode: rawLoc?.pincode ?? req.body.pincode ?? "",
            address: rawLoc?.address ?? req.body.address ?? "",
            landmark: rawLoc?.landmark ?? req.body.landmark ?? "",
          };
        }
      }

      const doc: any = {
        userId,
        category: "Pharmacy",
        medicineName: req.body.medicineName ?? req.body.serviceName,
        composition: compositionArr.length
          ? JSON.stringify(compositionArr)
          : undefined,
        segment: req.body.segment ?? req.body.category, // e.g. "Over-the-Counter"
        suppliedAs: suppliedAsArr,
        mrp: Number(req.body.mrp),
        per: req.body.per,
        size: req.body.size,
        image: imageData,
        description: req.body.description ?? "",
        isAvailable: req.body.isAvailable ?? true,
        lead: req.body.lead ?? false,
        serviceType: "pharmacy",
        ...(location ? { location } : {}),
      };

      // Basic required checks before hitting Mongo validations
      if (!doc.medicineName)
        return next(new ErrorHandler("medicineName is required", 400));
      if (!doc.segment)
        return next(new ErrorHandler("segment is required", 400));
      if (Number.isNaN(doc.mrp))
        return next(new ErrorHandler("mrp must be a number", 400));

      const created = await PharmacyServices.create(doc);
      return res
        .status(201)
        .json({
          success: true,
          pharmacyService: created,
          message: "Pharmacy service created successfully",
        });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
);






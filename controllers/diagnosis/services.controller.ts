import express, {NextFunction,Request,Response} from "express"
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import { DoctorService } from "../../modals/doctor.modal/services.modal";
import { DiagnosticModel } from "../../modals/diagnostic.model";
import ErrorHandler from "../../utils/ErrorHandler";

export const createDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let avatarData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        avatarData = await streamUploadToCloudinary(req.file, "doctor-service");
      }
      let location = {};

      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid location data" });
      }

      const parsedBody = {
        ...req.body,
        location,
      };

      const doctor = new DiagnosticModel({
        ...parsedBody,
        avatar: {
          url: avatarData.secure_url,
          public_id: avatarData.public_id,
        },
      });

      await doctor.save();

      res.status(201).json({
        success: true,
        doctor,
        message: "Service created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// READ ALL
export const getAllDoctorServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const services = await DoctorService.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, services });
  }
);

// READ SINGLE
export const getSingleDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await DoctorService.findById(req.params.id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

// UPDATE
export const updateDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let service = await DoctorService.findById(req.params.id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }

    if (req.file) {
      const avatarData = await streamUploadToCloudinary(
        req.file,
        "doctor-service"
      );
      req.body.avatar = {
        url: avatarData.secure_url,
        public_id: avatarData.public_id,
      };
    }

    service = await DoctorService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  }
);

// DELETE
export const deleteDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await DoctorService.findById(req.params.id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  }
);

// ADMIN STATS (example: total services, average fee, etc.)
export const getDoctorServiceStats = CatchAsyncError(
  async (req: Request, res: Response) => {
    const totalServices = await DoctorService.countDocuments();
    const averageFee = await DoctorService.aggregate([
      { $group: { _id: null, avgFee: { $avg: "$fee" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalServices,
        averageFee: averageFee[0]?.avgFee || 0,
      },
    });
  }
);
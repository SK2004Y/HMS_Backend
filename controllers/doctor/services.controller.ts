import express, { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { DiagnosticProfile } from "../../modals/diagnosis.modal/diagnosisProfile.modal";
import cloudinary, { streamUploadToCloudinary } from "../../utils/cloudinary";

import ErrorHandler from "../../utils/ErrorHandler";
import { DoctorService } from "../../modals/doctor.modal/services.modal";
// export const createDoctorService = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log("API hit: CreatedServices");
//       console.log("Request Body:", req.body);
//       console.log("File:", req.file);
//       let avatarData = {
//         secure_url: "",
//         public_id: "",
//       };

//       if (req.file) {
//         avatarData = await streamUploadToCloudinary(req.file, "doctor-service");
//       }

//       const parsedBody = {
//         ...req.body,
//       };

//       const doctor = new DoctorService({
//         ...parsedBody,
//         avatar: {
//           url: avatarData.secure_url,
//           public_id: avatarData.public_id,
//         },
//       });

//       await doctor.save();

//       res.status(201).json({
//         success: true,
//         doctor,
//         message: "Services Created  successfully",
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );





// CREATE
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

      const parsedBody = {
        ...req.body,
      };

      const doctor = new DoctorService({
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

export const getAllDoctorServices = CatchAsyncError(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 3; // Make it configurable (3 for demo)
  const skip = (page - 1) * limit;

  try {
    console.log(
      "Fetching services | Page:",
      page,
      "| Limit:",
      limit,
      "| Skip:",
      skip
    );

    const services = await DoctorService.find().skip(skip).limit(limit);
    const total = await DoctorService.countDocuments();

    res.status(200).json({
      services,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllDoctorServices:", error);
    res.status(500).json({ message: "Failed to fetch services", error });
  }

});


// READ SINGLE
export const getSingleDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
   
    const id=req.params.id;
    console.log(`id is receive${id}`,id);
    const service = await DoctorService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

// UPDATE
export const updateDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    let service = await DoctorService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }

    // ✅ If new image is being uploaded
    if (req.file) {
      // ✅ Delete previous image from Cloudinary
      if (service.image && service.image.public_id) {
        await cloudinary.uploader.destroy(service.image.public_id);
      }

      // ✅ Upload new image
      const avatarData = await streamUploadToCloudinary(req.file, "doctor-service");
      req.body.avatar = {
        url: avatarData.secure_url,
        public_id: avatarData.public_id,
      };
    }

    // ✅ Update the service
    service = await DoctorService.findByIdAndUpdate(id, req.body, {
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

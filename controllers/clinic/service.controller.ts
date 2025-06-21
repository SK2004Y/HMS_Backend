import express, { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import {
  streamUploadMultipleToCloudinary,
  streamUploadToCloudinary,
} from "../../utils/cloudinary";
import { ClinicService } from "../../modals/clinic.modal/service.modal";
import ErrorHandler from "../../utils/ErrorHandler";

export const createClinicService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`clinic body data `, req.body);

      const files = req.files as Express.Multer.File[];
      let location = undefined;

      // ✅ Parse location safely
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
          }
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid location format (must be JSON with coordinates).",
          });
        }
      }

      // ✅ Upload images
      const folder = "clinic";
      const { images } = await streamUploadMultipleToCloudinary(files, folder);

      let imageData = { url: "", public_id: "" };
      if (images.length > 0) {
        imageData = {
          url: images[0].url,
          public_id: images[0].public_id,
        };
      }

      // ✅ Parse modes
      let modes = req.body.modes;
      if (typeof modes === "string") {
        modes = modes.split(",").map((mode: string) => mode.trim());
      }
      console.log("Parsed modes:", modes);

      // ✅ Prepare body for DB
      const parsedBody = {
        ...req.body,
        modes,
        location,
        image: imageData,
      };

      const clinicService = new ClinicService(parsedBody);
      await clinicService.save();

      res.status(201).json({
        success: true,
        clinicService,
        message: "Clinic service created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);





















// //2nd
// export const createClinicService = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {

//       console.log(`clinic body data `,req.body)
//       const files = req.files as Express.Multer.File[];
//       let location;

//       if (req.body.location) {
//         try {
//           const parsed = JSON.parse(req.body.location);

//           const lon = parseFloat(parsed.coordinates?.[0]);
//           const lat = parseFloat(parsed.coordinates?.[1]);

//           if (!isNaN(lon) && !isNaN(lat)) {
//             location = {
//               type: "Point",
//               coordinates: [lon, lat],
//               city: parsed.city || "",
//               state: parsed.state || "",
//               pincode: parsed.pincode || "",
//               landmark: parsed.landmark || "",
//             };
//           } else {
//             console.warn(
//               "Invalid coordinates in req.body.location. Falling back to user profile location."
//             );
//           }
//         } catch (err) {
//           console.warn(
//             "Location parsing failed. Falling back to user profile location."
//           );
//         }
//       }

//       // 🔁 If no valid location, fallback to ProfileCompletion
//       if (!location && req.body.userId) {
//         const userProfile = await ProfileCompletion.findOne({
//           userId: req.body.userId,
//         });

//         if (userProfile?.location?.coordinates?.length === 2) {
//           const [lon, lat] = userProfile.location.coordinates;

//           if (!isNaN(lon) && !isNaN(lat)) {
//             location = {
//               ...(userProfile.location.toObject?.() || userProfile.location),
//               coordinates: [lon, lat],
//             };
//           }
//         }
//       }

//       const folder = "clinic";
//       const { images } = await streamUploadMultipleToCloudinary(files, folder);

//       // ✅ You likely uploaded multiple images, so check if it's an array
//       let imageData = { secure_url: "", public_id: "" };
//       if (images.length > 0) {
//         imageData = {
//           secure_url: images[0].secure_url, // take the first one (if only one expected)
//           public_id: images[0].public_id,
//         };
//       }

//       // ✅ Safely parse location JSON

//       try {
//         location = JSON.parse(req.body.location);
//       } catch (err) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid location data" });
//       }

//       // ✅ Prepare and save to DB
//       const parsedBody = {
//         ...req.body,
//         location,
//         image: imageData, // ✅ store the uploaded image info
//       };

//       const clinicService = new ClinicService(parsedBody);
//       await clinicService.save();

//       res.status(201).json({
//         success: true,
//         clinicService,
//         message: "Clinic service created successfully",
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

import express, {NextFunction,Request,Response} from "express"
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import ErrorHandler from "../../utils/ErrorHandler";

export const createRadiologyService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

        console.log(
          `Readiology services hitted ${JSON.stringify(req.body)}`,
          req.body
        );


        const bodydata= JSON.stringify(req.body);

console.log(`body data is ${bodydata}`,bodydata)
      let avatarData = {
        secure_url: "",
        public_id: "",
      };

      if (req.file) {
        avatarData = await streamUploadToCloudinary(req.file, "radiology-service");
      }


      let location = {};

    //   try {
    //     location = JSON.parse(req.body.location);
    //   } catch (err) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Invalid location data" });
    //   }

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
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



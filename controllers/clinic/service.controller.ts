import express, {NextFunction,Request,Response} from "express"
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { streamUploadToCloudinary } from "../../utils/cloudinary";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import ErrorHandler from "../../utils/ErrorHandler";

export const createClinicService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

        console.log(
          `Readiology services hitted ${JSON.stringify(req.body)}`,
          req.body
        );


        console.log(`request without json`,req.body);

    

  


      let imageData = {
        secure_url: "",
        public_id: "",
      };

      

      

      let location = {};

    //   try {
    //     location = JSON.parse(req.body.location);
    //   } catch (err) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Invalid location data" });
    //   }

    if(location){
      location=JSON.parse(req.body.location);
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
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



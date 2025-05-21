import { PatientModel } from "../modals/patient.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { ErrorMiddleware}  from "../middleware/error";
import { NextFunction ,Response,Request} from "express";
import ErrorHandler from "../utils/ErrorHandler";


//update patient details after login 
export const updatePatientProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { userId } = req.body;

      const patient = await PatientModel.findOneAndUpdate(
        { userId },
        req.body,
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      res.status(200).json({ success: true, patient });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }


  }
);




//get  patient profile (individual)
export const getPatientProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { Id }= req.params;
      const patient = await PatientModel.findOne({Id });

      if (!patient) return next(new ErrorHandler("Patient not found", 404));

      res.status(200).json({ success: true, patient });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//get  all patient profile 
export const getallPatientProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    try {
      const userId = req.params.userId;
      const patient = await PatientModel.find({});
      const patientCount=patient?.length;

      if (!patient) return next(new ErrorHandler("Patient not found", 404));

      res.status(200).json({ success: true,message:"total patient profile ", patient ,patientCount});
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);





//delete patient profile 
export const deletePatientProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {


    try{
    const {Id} = req.params;
    const deleted = await PatientModel.findOneAndDelete({ Id });

    if (!deleted) return next(new ErrorHandler("Patient not found", 404));

    res.status(200).json({ success: true, message: "Patient profile deleted" });
    }

     catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  

  }
);








//patient stats 
export const getPatientStats = CatchAsyncError(async (_req: Request, res: Response) => {
  const total       = await PatientModel.countDocuments();
  const approved = await PatientModel.countDocuments({ isApproved: true });
  const pending = await PatientModel.countDocuments({ isApproved: false });
  const byCity = await PatientModel.aggregate([
    { $group: { _id: "$location.city", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: { total, approved, pending, byCity }
  });
});
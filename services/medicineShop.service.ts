import express, {Request,Response,NextFunction} from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { MedicineModel } from "../modals/medicineshop.model";
import ErrorHandler from "../utils/ErrorHandler";


// Admin: Get all medicine shops (with optional search/filter)







//get all shops 
export const getAllMedicineShopsAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shops = await MedicineModel.find();
    
    res.status(200).json({
      success: true,
      count: shops.length,
      shops,
    });
  }
);

// Admin: Approve/Disapprove a medicine shop
export const approveMedicineShop = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.findById(req.params.id);

    if (!shop) {
      return next(new ErrorHandler("Medicine shop not found", 404));
    }

    shop.status = req.body.status; // status can be "Approved" or "Disapproved"
    await shop.save();

    res.status(200).json({
      success: true,
      message: `Medicine Shop ${req.body.status} successfully`,
    });
  }
);

// Admin: Delete a medicine shop
export const deleteMedicineShopAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.findById(req.params.id);

    if (!shop) {
      return next(new ErrorHandler("Medicine shop not found", 404));
    }

    await shop.deleteOne();

    res.status(200).json({
      success: true,
      message: "Medicine Shop deleted successfully",
    });
  }
);


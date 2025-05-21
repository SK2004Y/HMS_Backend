import { Request, Response, NextFunction } from "express";
import { MedicineModel} from "../../modals/medicineshop.model";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import ErrorHandler from "../../utils/ErrorHandler";

// Admin: Get all medicine shops (with optional search/filter)
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


// 2. Get All Medicine Shops (With Search, Filter, Pagination)
export const getAllMedicineShops = CatchAsyncError(
  async (req: Request, res: Response) => {
    let query = MedicineModel.find();

    // const allshops= await query?.length;

    // Search
    if (req.query.search) {
      const keyword = req.query.search as string;
      query = query.find({ name: { $regex: keyword, $options: "i" } });
    }

    // Filter by city
    if (req.query.city) {
      const city = req.query.city as string;
      query = query.find({ "location.city": { $regex: city, $options: "i" } });
    }

    // Filter by isApproved
    if (req.query.isApproved) {
      query = query.find({ isApproved: req.query.isApproved === "true" });
    }
    // Filter by geolocation (latitude, longitude, and radius in km)
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string);

      // Convert radius from kilometers to radians
      const earthRadiusKm = 6378.1;
      const radiusInRadians = radius / earthRadiusKm;

      query = query.find({
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radiusInRadians],
          },
        },
      });
    }
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await MedicineModel.countDocuments(query.getFilter());
    const shops = await query.skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      shops,
    });
  }
);

// Admin: Approve/Disapprove a medicine shop
export const approveMedicineShop = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.findById(req.params.id);

    console.log(`approveshop is ${shop}`);
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


// Admin: Get counts of shops (pending, approved, disapproved)
export const getMedicineShopStats = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const totalShops = await MedicineModel.countDocuments();
  const approvedShops = await MedicineModel.countDocuments({ isApproved: true });
  const pendingShops = await MedicineModel.countDocuments({ isApproved: false, status: "active" });
  const inactiveShops = await MedicineModel.countDocuments({ status: "inactive" });

  res.status(200).json({
    success: true,
    stats: {
      totalShops,
      approvedShops,
      pendingShops,
      inactiveShops,
    },
  });
});



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

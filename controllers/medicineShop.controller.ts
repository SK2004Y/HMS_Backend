import { Request, Response, NextFunction } from "express";
import { MedicineModel } from "../modals/medicineshop.model"; // adjust your path
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { messagess } from "./reports/medicine-report.controller";
import mongoose from "mongoose";

// 1. Create Medicine Shop
export const createMedicineShop = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, charge, location } = req.body;

    if (!name || !charge || !location || !location.coordinates) {
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const shop = await MedicineModel.create({
      ...req.body,
      userId: req.user._id, // Assuming you attach user in auth middleware
    });

    res.status(201).json({
      success: true,
      message: "Medicine Shop created successfully",
      shop,
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

export const getallShops = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.find();
    const total=shop.length;

    if (!shop) {
      return next(new ErrorHandler("Medicine Shop not found", 404));
    }

    res.status(200).json({
      success: true,
      messages:"all medicineShop ",
      total,
      shop,
    });
  }
);

// 3. Get Single Medicine Shop
export const getSingleMedicineShop = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.findById(req.params.id);

    if (!shop) {
      return next(new ErrorHandler("Medicine Shop not found", 404));
    }

    res.status(200).json({
      success: true,
      shop,
    });
  }
);

// 4. Update Medicine Shop Details
export const updateMedicineShop = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`hti update`);
    const shops=req.params._id;
    let shop = await MedicineModel.findById(req.params.id);
    console.log(`shopid is ${shops}`);

    if (!shop) {
      return next(new ErrorHandler("Medicine Shop not found", 404));
    }

    shop = await MedicineModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Medicine Shop updated successfully",
      shop,
    });
  }
);




// 6. Approve / Disapprove Medicine Shop (Admin Only)
export const approveMedicineShop = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.findById(req.params.id);

    if (!shop) {
      return next(new ErrorHandler("Medicine Shop not found", 404));
    }

    shop.isApproved = !shop.isApproved;
    await shop.save();

    res.status(200).json({
      success: true,
      message: `Medicine Shop has been ${
        shop.isApproved ? "approved" : "disapproved"
      }`,
    });
  }
);

// 7. Update Online Status
export const updateOnlineStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shop = await MedicineModel.findById(req.params.id);

    if (!shop) {
      return next(new ErrorHandler("Medicine Shop not found", 404));
    }

    shop.onlineStatus = req.body.onlineStatus;
    await shop.save();

    res.status(200).json({
      success: true,
      message: `Online status updated to ${shop.onlineStatus}`,
    });
  }
);




//medicine services 

// add single services and multiple
export const addMedicineService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { medicineService } = req.body;
    const {id}=req.params;

    if (
      !medicineService ||
      !Array.isArray(medicineService) ||
      medicineService.length === 0
    ) {
      return next(
        new ErrorHandler("Please provide at least one medicine service", 400)
      );
    }

    // Validate each service
    for (const service of medicineService) {
      const { name, rate, discount, remark } = service;
      if (!name || !rate || !discount || !remark) {
        return next(
          new ErrorHandler(
            "Each service must have name, rate, discount, and remark",
            400
          )
        );
      }
    }
    

    const shop = await MedicineModel.findById(id);

    if (!shop) {
      return next(new ErrorHandler("Medicine Shop not found", 404));
    }

    // Add each service to shop
    for (const service of medicineService) {
      shop.medicineService.push(service);
    }

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Medicine services added successfully",
      shop,
    });
  }
);

export const updateMedicineService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const ids =req.params._id;
    console.log(`paramsid is ${ids}`)
    const updates = req.body;


    console.log(`medicineServicesId is ${id}`);
    const shop = await MedicineModel.findOneAndUpdate(
      { "medicineService._id": id },
      { $set: { "medicineService.$": updates } },
      { new: true }
    );

    if (!shop) {
      return next(new ErrorHandler("Medicine Service not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Medicine Service updated successfully",
      shop,
    });
  }
);

// Get all medicine services across all shops
export const allMedicineService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const shops = await MedicineModel.find({}, { medicineService: 1, name: 1 });

    const allServices = shops.flatMap(shop =>
      shop.medicineService.map(service => ({
        ...service.toObject() as any,
        shopName: shop.name,
        shopId: shop._id,
      }))
    );

    res.status(200).json({
      success: true,
      count: allServices.length,
      services: allServices,
    });
  }
);


export const deleteMedicineService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { medicineServiceId } = req.params;

    console.log(`medicineShopid is delte ${medicineServiceId}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(medicineServiceId)) {
      return next(new ErrorHandler("Invalid Medicine Service ID", 400));
    }

    let shops = await MedicineModel.findOne({ _id: medicineServiceId });
    //  console.log(`medicineShopid is data`,shops);

    // First, find the shop that contains the medicineService
    const shop = await MedicineModel.findOne({
      "medicineService._id": medicineServiceId,
    });
  
    if (!shop) {
      return next(new ErrorHandler("Medicine Service not found", 404));
    }

    // Perform deletion
    shop.medicineService = shop.medicineService.filter(
      (service) => service._id.toString() !== medicineServiceId
    );

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Medicine Service deleted successfully",
      shop,
    });
  }
);





//review controllers

export const addOrUpdateMedicineReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { medicineId } = req.params;
    const { userId, userType, rating, comment } = req.body;

    if (!userId || !userType || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const medicine = await MedicineModel.findById(medicineId);
    if (!medicine)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    // const existingReviewIndex = review.reviews.findIndex(
    //   (r: any) => r.userId.toString() === userId && r.userType === userType
    // );
const existingReviewIndex = medicine.reviews.findIndex(
  (r: any) => r.userId?.toString() === userId && r.userType === userType
);
    if (existingReviewIndex !== -1) {
      medicine.reviews[existingReviewIndex].rating = rating;
      medicine.reviews[existingReviewIndex].comment = comment;
    } else {
      medicine.reviews.push({ userId, userType, rating, comment });
    }

    await medicine.save();

    res.status(200).json({
      success: true,
      message: "Review saved successfully",
      reviews: medicine.reviews,
    });
  }
);


export const getMedicineReviews = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { medicineId } = req.params;


    const medicine = await MedicineModel.findById(medicineId).populate(
      "reviews.userId",
      "name"
    );
 

    const total = medicine?.reviews?.length;
    if (!medicine)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    res.status(200).json({ success: true, total, reviews: medicine.reviews });
  }
);


export const deleteMedicineReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { medicineId, userId, userType } = req.params;

    const medicine = await MedicineModel.findById(medicineId);
    if (!medicine)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    medicine.reviews = medicine.reviews.filter(
      (r: any) => !(r.userId.toString() === userId && r.userType === userType)
    );

    await medicine.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  }
);
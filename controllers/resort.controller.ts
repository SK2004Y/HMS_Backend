import { Request, Response } from "express";
import { ResortModel } from "../modals/resort.model";
import {CatchAsyncError} from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

// 1. Create a new Resort
// export const createResort = CatchAsyncError(
//   async (req: Request, res: Response) => {
//     const data = {
//       ...req.body,
//       userId: req.user._id, // from authenticated user
//       isApproved: false,
//       onlineStatus: false,
//       status: "active",
//     };
//     const resort = await ResortModel.create(data);
//     res.status(201).json({ success: true, resort });
//   }
// );

// 2. Update Own Resort
export const updateResort = CatchAsyncError(
  async (req: Request, res: Response) => {
    const resort = await ResortModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!resort)
      throw new ErrorHandler("Resort not found or unauthorized", 404);
    res.status(200).json({ success: true, resort });
  }
);

// 3. Get Own Resort
export const getMyResort = CatchAsyncError(
  async (req: Request, res: Response) => {
    const resort = await ResortModel.findOne({ userId: req.user._id });
    if (!resort) throw new ErrorHandler("No resort found for this user", 404);
    res.status(200).json({ success: true, resort });
  }
);

// 4. Delete Own Resort
export const deleteResort = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { resortId } = req.params;
    const resort = await ResortModel.findOneAndDelete({
      resortId,
      userId: req.user._id,
    });
    if (!resort)
      throw new ErrorHandler("Resort not found or unauthorized", 404);
    res.status(200).json({ success: true, message: "Resort deleted" });
  }
);

// 5. List All Resorts (public, with search/filter/pagination)
export const listResorts = CatchAsyncError(
  async (req: Request, res: Response) => {
    let query = ResortModel.find();

    // search by name
    if (req.query.search) {
      query = query.find({
        name: { $regex: req.query.search as string, $options: "i" },
      });
    }
    // filter by city
    if (req.query.city) {
      query = query.find({
        "location.city": { $regex: req.query.city as string, $options: "i" },
      });
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await ResortModel.countDocuments(query.getFilter());
    const resorts = await query.skip(skip).limit(limit);

    res.status(200).json({ success: true, total,  resorts });
  }
);


//for admin section

// 1. Get All Resorts (admin, no user filter)
export const getAllResortsAdmin = CatchAsyncError(async (_req: Request, res: Response) => {
  const resorts = await ResortModel.find();
  res.status(200).json({ success: true, count: resorts.length, resorts });
});

// 2. Approve or Reject Resort
export const approveResort = CatchAsyncError(async (req: Request, res: Response) => {
  const { resortId } = req.params;
  const resort = await ResortModel.findById(resortId);
  if (!resort) throw new ErrorHandler("Resort not found", 404);

  resort.isApproved = req.body.isApproved === true;
  resort.status     = req.body.status || resort.status;
  await resort.save();

  res.status(200).json({ success: true, resort });
});

// 3. Delete Any Resort
export const deleteResortAdmin = CatchAsyncError(async (req: Request, res: Response) => {
  const {resortId}=req.params;
  const resort = await ResortModel.findByIdAndDelete(resortId);
  if (!resort) throw new ErrorHandler("Resort not found", 404);

  res.status(200).json({ success: true, message: "Resort deleted by admin" });
});

// 4. Resort Stats (count by city & approval)
export const getResortStats = CatchAsyncError(async (_req: Request, res: Response) => {
  const total       = await ResortModel.countDocuments();
  const approved    = await ResortModel.countDocuments({ isApproved: true });
  const pending     = await ResortModel.countDocuments({ isApproved: false });
  const byCity = await ResortModel.aggregate([
    { $group: { _id: "$location.city", count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    stats: { total, approved, pending, byCity }
  });
});





//review controllers

export const addOrUpdateResortReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { resortId } = req.params;
    const { userId, userType, rating, comment } = req.body;

    if (!userId || !userType || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const resort = await ResortModel.findById(resortId);
    if (!resort)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    // const existingReviewIndex = review.reviews.findIndex(
    //   (r: any) => r.userId.toString() === userId && r.userType === userType
    // );
const existingReviewIndex = resort.reviews.findIndex(
  (r: any) => r.userId?.toString() === userId && r.userType === userType
);
    if (existingReviewIndex !== -1) {
      resort.reviews[existingReviewIndex].rating = rating;
      resort.reviews[existingReviewIndex].comment = comment;
    } else {
      resort.reviews.push({ userId, userType, rating, comment });
    }

    await resort.save();

    res.status(200).json({
      success: true,
      message: "Review saved successfully",
      reviews: resort.reviews,
    });
  }
);


export const getResortReviews = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { resortId } = req.params;


    const resort = await ResortModel.findById(resortId).populate(
      "reviews.userId",
      "name"
    );
 

    const total = resort?.reviews?.length;
    if (!resort)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    res.status(200).json({ success: true, total, reviews: resort.reviews });
  }
);


export const deleteResortReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { resortId, userId, userType } = req.params;

    const resort = await ResortModel.findById(resortId);
    if (!resort)
      return res
        .status(404)
        .json({ success: false, message: "review not found" });

    resort.reviews = resort.reviews.filter(
      (r: any) => !(r.userId.toString() === userId && r.userType === userType)
    );

    await resort.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  }
);
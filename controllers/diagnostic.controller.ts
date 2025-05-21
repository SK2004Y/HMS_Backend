import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { DiagnosticModel } from "../modals/diagnostic.model";
import express, { Request, Response, NextFunction } from "express";
import { DiagnosticBookingModel } from "../services/diagnosticBooking.service";




export const registerDiagnostic = CatchAsyncError(async (req, res) => {
  const newDiagnostic = await DiagnosticModel.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json({ success: true, diagnostic: newDiagnostic });
});


export const updateDiagnostic = CatchAsyncError(async (req, res) => {
  const updated = await DiagnosticModel.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.status(200).json({ success: true, diagnostic: updated });
});


export const addDiagnosticTest = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const diagnostic = await DiagnosticModel.findById(id);
    if (!diagnostic) {
      return res
        .status(404)
        .json({ success: false, message: "Diagnostic not found" });
    }

    // Add new test to the `tests` array
    diagnostic.tests.push(req.body);

    await diagnostic.save();

    res.status(200).json({
      success: true,
      message: "Diagnostic test added successfully",
      tests: diagnostic.tests,
    });
  }
);

export const updateDiagnosticTest = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { id, testId } = req.params;

    const diagnostic = await DiagnosticModel.findById(id);
    if (!diagnostic) {
      return res
        .status(404)
        .json({ success: false, message: "Diagnostic not found" });
    }

    const test = diagnostic.tests.id(testId);
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Update fields
    Object.assign(test, req.body);
    await diagnostic.save();

    res.status(200).json({
      success: true,
      message: "Diagnostic test updated successfully",
      test,
    });
  }
);

export const deleteDiagnosticTest = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { id, testId } = req.params;

    const diagnostic = await DiagnosticModel.findById(id);
    if (!diagnostic) {
      return res
        .status(404)
        .json({ success: false, message: "Diagnostic not found" });
    }

    const testExists = diagnostic.tests.id(testId);
    if (!testExists) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    diagnostic.tests.pull(testId); // ✅ remove test using pull
    await diagnostic.save();

    res.status(200).json({
      success: true,
      message: "Diagnostic test deleted successfully",
    });
  }
);




export const getAllTestsByDiagnostic = CatchAsyncError(async (req, res) => {
  const diagnostic = await DiagnosticModel.findOne({
    diagnosticId: req.params.id,
  });
  if (!diagnostic) {
    return res
      .status(404)
      .json({ success: false, message: "Diagnostic not found" });
  }

  const total = diagnostic.tests.length;
  res.status(200).json({ success: true, tests: diagnostic.tests, total });
});


export const bookDiagnosticTest = CatchAsyncError(async (req, res) => {

  const { diagnosticId } = req.params;

  const booking = await DiagnosticBookingModel.create({
    userId: req.user._id,
    diagnosticId,
    testId: req.body.testId,
    preferredDate: req.body.preferredDate,
    status: "pending",
  });

  // console.log(`diagnosticId is ${dia}`)

  res.status(201).json({ success: true, booking });
});


export const updateDiagnosticBooking = CatchAsyncError(async (req, res) => {
  const { bookingId } = req.params;
  const { preferredDate, status } = req.body;

  const booking = await DiagnosticBookingModel.findById(bookingId);
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  }

  if (preferredDate) booking.preferredDate = preferredDate;
  if (status) booking.status = status;

  await booking.save();

  res.status(200).json({
    success: true,
    message: "Booking updated successfully",
    booking,
  });
});


export const deleteDiagnosticBooking = CatchAsyncError(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await DiagnosticBookingModel.findByIdAndDelete(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
  });
});



export const getBookingsForDiagnostic = CatchAsyncError(async (req, res) => {
  const bookings = await DiagnosticModel.find({
    diagnosticId: req.params.id,
  });
  res.status(200).json({ success: true, bookings });
});


export const addDiagnosticReview = CatchAsyncError(async (req, res) => {
  const { rating, comment } = req.body;

  const diagnostic = await DiagnosticModel.findById(req.params.id);
  if (!diagnostic)
    return res.status(404).json({ success: false, message: "Not found" });

  diagnostic.reviews.push({ doctorId: req.doctor._id, rating, comment });
  diagnostic.rating =
    (diagnostic.rating + rating) / (diagnostic.reviews.length || 1);

  await diagnostic.save();
  res.status(200).json({ success: true, message: "Review submitted" });
});

//review controllers

export const addOrUpdateDiagnosticReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { diagnosticId } = req.params;
    const { userId, userType, rating, comment } = req.body;

    if (!userId || !userType || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const diagnostic = await DiagnosticModel.findById(diagnosticId);
    if (!diagnostic)
      return res
        .status(404)
        .json({ success: false, message: "Diagnostic not found" });

    // const existingReviewIndex = diagnostic.reviews.findIndex(
    //   (r: any) => r.userId.toString() === userId && r.userType === userType
    // );
const existingReviewIndex = diagnostic.reviews.findIndex(
  (r: any) => r.userId?.toString() === userId && r.userType === userType
);
    if (existingReviewIndex !== -1) {
      diagnostic.reviews[existingReviewIndex].rating = rating;
      diagnostic.reviews[existingReviewIndex].comment = comment;
    } else {
      diagnostic.reviews.push({ userId, userType, rating, comment });
    }

    await diagnostic.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Review saved successfully",
        reviews: diagnostic.reviews,
      });
  }
);


export const getDiagnosticReviews = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { diagnoticId } = req.params;


    const diagnostic = await DiagnosticModel.findById(diagnoticId).populate(
      "reviews.userId",
      "name"
    );
 

    const total = diagnostic?.reviews?.length;
    if (!diagnostic)
      return res
        .status(404)
        .json({ success: false, message: "Diagnostic not found" });

    res.status(200).json({ success: true, total, reviews: diagnostic.reviews });
  }
);


export const deleteDiagnosticReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { diagnosticId, userId, userType } = req.params;

    const diagnostic = await DiagnosticModel.findById(diagnosticId);
    if (!diagnostic)
      return res
        .status(404)
        .json({ success: false, message: "Diagnostic not found" });

    diagnostic.reviews = diagnostic.reviews.filter(
      (r: any) => !(r.userId.toString() === userId && r.userType === userType)
    );

    await diagnostic.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  }
);




//admin approve controller 
export const approveDiagnostic = CatchAsyncError(async (req, res) => {
  const diagnostic = await DiagnosticModel.findById(req.params.id);
  if (!diagnostic)
    return res.status(404).json({ success: false, message: "Not found" });

  diagnostic.isApproved = true;
  diagnostic.status = "active";
  await diagnostic.save();

  res
    .status(200)
    .json({ success: true, message: "Diagnostic Center approved", diagnostic });
});


export const getAllDiagnostics = CatchAsyncError(async (req, res) => {
  let query = DiagnosticModel.find();

  if (req.query.search) {
    const keyword = req.query.search as string;
    query = query.find({ name: { $regex: keyword, $options: "i" } });
  }

  if (req.query.city) {
    query = query.find({ "location.city": req.query.city });
  }

  if (req.query.isApproved) {
    query = query.find({ isApproved: req.query.isApproved === "true" });
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await DiagnosticModel.countDocuments(query.getFilter());
  const diagnostics = await query.skip(skip).limit(limit);

  res.status(200).json({ success: true, total, page, limit, diagnostics });
});



export const deleteDiagnostic = CatchAsyncError(async (req, res) => {
  const {diagnosticId} =req.params;
  const diagnostic = await DiagnosticModel.findByIdAndDelete(diagnosticId);
  if (!diagnostic)
    return res.status(404).json({ success: false, message: "Not found" });

  res.status(200).json({ success: true, message: "Deleted successfully" });
});



export const getDiagnosticStats = CatchAsyncError(async (_req: Request, res: Response) => {
  const total       = await DiagnosticModel.countDocuments();
  const approved = await DiagnosticModel.countDocuments({ isApproved: true });
  const pending = await DiagnosticModel.countDocuments({ isApproved: false });
  const byCity = await DiagnosticModel.aggregate([
    { $group: { _id: "$location.city", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: { total, approved, pending, byCity }
  });
});
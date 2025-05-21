


import { NextFunction, Request, Response } from "express";
import { ClinicModel, IServiceOffered } from "../modals/clinic.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { ISocialInteraction } from "../modals/clinic.model";
import { messagess } from "./reports/doctor-report.controller";

// Add or update services offered
export const updateClinicServices = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { servicesOffered, socialInteraction } = req.body;

    // Validate that `servicesOffered` is an array of objects
    if (servicesOffered && !Array.isArray(servicesOffered)) {
      return res.status(400).json({
        success: false,
        message: "servicesOffered must be an array of objects.",
      });
    }

    // Validate `socialInteraction` object
    if (socialInteraction && typeof socialInteraction !== "object") {
      return res.status(400).json({
        success: false,
        message: "socialInteraction must be an object.",
      });
    }

    // Update clinic with the new services and social interactions
    const clinic = await ClinicModel.findByIdAndUpdate(
      id,
      {
        $set: {
          servicesOffered: servicesOffered || undefined,
          socialInteraction: socialInteraction || undefined,
        },
      },
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Clinic updated successfully.",
      clinic,
    });
  }
);



//socail interactions
// Add or update social interaction data
export const updateClinicSocialInteraction = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { socialInteraction } = req.body;

    if (!socialInteraction || typeof socialInteraction !== "object") {
      return res
        .status(400)
        .json({
          success: false,
          message: "socialInteraction data is required.",
        });
    }

    const clinic = await ClinicModel.findByIdAndUpdate(
      id,
      { $set: { socialInteraction } },
      { new: true, runValidators: true, projection: { socialInteraction: 1 } } // Only return socialInteraction
    );

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    res.status(200).json({
      success: true,
      message: "Social interaction updated",
      socialInteraction: clinic.socialInteraction,
    });
  }
);


//delete social interaction
export const deleteClinicSocialInteraction = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const clinic = await ClinicModel.findByIdAndUpdate(
      id,
      { $unset: { socialInteraction: "" } }, // Remove the field
      { new: true }
    ).select("socialInteraction"); // Only return socialInteraction field (should be undefined/null after deletion)

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    res.status(200).json({
      success: true,
      message: "Social interaction deleted",
      socialInteraction: clinic.socialInteraction || null,
    });
  }
);







// Add new ServiceOffered to Clinic
// Create multiple ServiceOffered to Clinic
export const createMultipleServicesOffered = CatchAsyncError(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { services } = req.body;

  // Validate input
  if (!Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ success: false, message: "Please provide an array of services." });
  }

  // Validate service fields
  for (const service of services) {
    if (!service.name || !service.rate || !service.picture) {
      return res.status(400).json({ success: false, message: "Each service must have a name, rate, and picture." });
    }
  }

  // Add services to the clinic
  const clinic = await ClinicModel.findByIdAndUpdate(
    id,
    { $push: { servicesOffered: { $each: services } } },
    { new: true, runValidators: true }
  );

  if (!clinic) {
    return res.status(404).json({ success: false, message: "Clinic not found" });
  }

  // Return services with their _id
  res.status(200).json({
    success: true,
    message: "Services added successfully",
    serviceoffer: clinic.servicesOffered,
  });
});






// Update a specific ServiceOffered by its ID
export const updateServiceOffered = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { clinicId, serviceId } = req.params;
    const { name, rate, discount, remark, picture, videolink } = req.body;

    // Update the specific service
    const clinic = await ClinicModel.findOneAndUpdate(
      { _id: clinicId, "servicesOffered._id": serviceId },
      {
        $set: {
          "servicesOffered.$.name": name,
          "servicesOffered.$.rate": rate,
          "servicesOffered.$.discount": discount,
          "servicesOffered.$.remark": remark,
          "servicesOffered.$.picture": picture,
          "servicesOffered.$.videolink": videolink,
        },
      },
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic or service not found" });
    }

    // Extract only the updated service
    const updatedService = clinic.servicesOffered.find(
      (service: any) => service._id.toString() === serviceId
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      serviceoffer: updatedService,
    });
  }
);




// Delete ServiceOffered from Clinic
export const deleteServiceOffered = CatchAsyncError(async (req: Request, res: Response) => {
  const { id, serviceId } = req.params;

  const clinic = await ClinicModel.findByIdAndUpdate(
    id,
    { $pull: { servicesOffered: { _id: serviceId } } }, // Pull the service with the matching _id
    { new: true }
  );

  if (!clinic) {
    return res.status(404).json({ success: false, message: "Clinic not found" });
  }

  res.status(200).json({ success: true, message: "Service deleted successfully" });
});



export const getClinicServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const clinic = await ClinicModel.findById(req.params.id).select(
      "servicesOffered"
    );

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    res.status(200).json({ success: true, services: clinic.servicesOffered });
  }
);




export const getClinicSocialInteraction = CatchAsyncError(
  async (req: Request, res: Response) => {
    const clinic = await ClinicModel.findById(req.params.id).select(
      "socialInteraction"
    );

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    res
      .status(200)
      .json({ success: true, socialInteraction: clinic.socialInteraction });
  }
);



//for admin controller 

export const getPastSocialInteractionStats = CatchAsyncError(
  async (req: Request, res: Response) => {
    const clinic = await ClinicModel.findById(req.params.id).select(
      "socialInteraction"
    );

    if (!clinic) {
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });
    }

    const today = new Date();

    const countEvents = (events: { date: Date }[]) =>
      events.filter((e) => new Date(e.date) < today).length;

    const social = clinic.socialInteraction;

    const stats = {
      //   pastCamps: countEvents(social.camps),
      //   pastAwareness: countEvents(social.awareness),
      //   pastPrograms: countEvents(social.programs),
      //   pastOutreach: countEvents(social.outreach),
      //   pastDonations: countEvents(social.donations),
    };

    res.status(200).json({
      success: true,
      //   totalPastEvents: Object.values(stats).reduce((a, b) => a + b, 0),
      //   ...stats,
    });
  }
);





// Delete clinic by ID (Admin Only)
export const deleteClinicById = CatchAsyncError(
  async (req: Request, res: Response) => {
    const {clinicId} = req.params;

    console.log(`clinicidis ${clinicId}`);

    // Optional: Check if clinic exists
    const clinic = await ClinicModel.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    await ClinicModel.findByIdAndDelete(clinicId);

    res.status(200).json({
      success: true,
      message: "Clinic deleted successfully",
    });
  }
);



export const approveClinic = CatchAsyncError(
  async (req: Request, res: Response) => {
    const clinicId = req.params.id;

    const clinic = await ClinicModel.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    clinic.isApproved = true;
    clinic.status = "active"; // optional
    await clinic.save();

    res.status(200).json({
      success: true,
      message: "Clinic approved successfully",
      clinic,
    });
  }
);


export const getallClinic = CatchAsyncError(
  async (req: Request, res: Response) => {
    const allClinics = await ClinicModel.find();

    if (!allClinics || allClinics.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No clinics found" });
    }

    const approvedCount = allClinics.filter(
      (clinic) => clinic.isApproved
    ).length;
    const notApprovedCount = allClinics.length - approvedCount;

    res.status(200).json({
      success: true,
      totalClinics: allClinics.length,
      approvedCount,
      notApprovedCount,
      message: "Clinic approval status counts",
    });
  }
);


//review controller
export const addOrUpdateClinicReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { clinicId } = req.params;
    const { userId, userType, rating, comment } = req.body;

    if (!userId || !userType || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const clinic = await ClinicModel.findById(clinicId);
    if (!clinic)
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });

    const existingReviewIndex = clinic.reviews.findIndex(
      (r: any) => r.userId.toString() === userId && r.userType === userType
    );

    if (existingReviewIndex !== -1) {
      clinic.reviews[existingReviewIndex].rating = rating;
      clinic.reviews[existingReviewIndex].comment = comment;
    } else {
      clinic.reviews.push({ userId, userType, rating, comment });
    }

    await clinic.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Review saved successfully",
        reviews: clinic.reviews,
      });
  }
);


export const getClinicReviews = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { clinicId } = req.params;
    console.log(`clinicid is here ${clinicId}`)

    const clinic = await ClinicModel.findById(clinicId).populate(
      "reviews.userId",
      "name"
    );

    const total=clinic?.reviews?.length;
    if (!clinic)
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });

    res.status(200).json({ success: true,total, reviews: clinic.reviews });
  }
);


export const deleteClinicReview = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { clinicId, userId, userType } = req.params;

    const clinic = await ClinicModel.findById(clinicId);
    if (!clinic)
      return res
        .status(404)
        .json({ success: false, message: "Clinic not found" });

    clinic.reviews = clinic.reviews.filter(
      (r: any) => !(r.userId.toString() === userId && r.userType === userType)
    );

    await clinic.save();

    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  }
);



export const getClinicStats = CatchAsyncError(async (_req: Request, res: Response) => {
  const total       = await ClinicModel.countDocuments();
  const approved = await ClinicModel.countDocuments({ isApproved: true });
  const pending = await ClinicModel.countDocuments({ isApproved: false });
  const byCity = await ClinicModel.aggregate([
    { $group: { _id: "$location.city", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: { total, approved, pending, byCity }
  });
});
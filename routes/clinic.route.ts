import express from "express";
import {
  updateClinicServices,
  updateClinicSocialInteraction,
  getClinicServices,
  getClinicSocialInteraction,
  // createServiceOffered,
  createMultipleServicesOffered,
  updateServiceOffered,
  deleteServiceOffered,
  deleteClinicSocialInteraction,
  approveClinic,
  getallClinic,
  deleteClinicById,
  addOrUpdateClinicReview,
  deleteClinicReview,
  getClinicReviews,
  getClinicStats,
} from "../controllers/clinic.controller";
import { isAuthneticated, authorizeRoles } from "../middleware/auth";

export const clinicRouter = express.Router();

// Protected Routes for Admin/User
clinicRouter.patch(
  "/update/:id",
  // isAuthneticated,
  // authorizeRoles("admin", "clinic"),
  updateClinicServices
);

clinicRouter.patch(
  "/update-socialI/:id/",
  // isAuthneticated,
  // authorizeRoles("admin", "clinic"),
  updateClinicSocialInteraction
);

clinicRouter.delete("/delete-socialI/:id",deleteClinicSocialInteraction);



//services

// Create Service Offered
clinicRouter.post("/create/:id/service", createMultipleServicesOffered);

// Update Service Offered
clinicRouter.put("/update/:clinicId/service/:serviceId", updateServiceOffered);

// Delete Service Offered
clinicRouter.delete("/delete/:id/:serviceId", deleteServiceOffered);

clinicRouter.get("/:id/services", getClinicServices);
clinicRouter.get("/:id/social", getClinicSocialInteraction);

//review system 
clinicRouter.post("/review/:clinicId",addOrUpdateClinicReview);

clinicRouter.get("/get-review/:clinicId", getClinicReviews);

clinicRouter.delete(
  "/:clinicId/review/:userId/:userType",
  deleteClinicReview
);


//admin
clinicRouter.get("/stats",getClinicStats)
clinicRouter.put("/approve/:id",approveClinic);
clinicRouter.get("/all",getallClinic)
clinicRouter.delete("/delete-clinic/:clinicId", deleteClinicById);
export default clinicRouter;

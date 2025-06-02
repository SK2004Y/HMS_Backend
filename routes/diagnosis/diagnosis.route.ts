import express from "express";
import { createDiagnosisProfile } from "../../controllers/diagnosis/profile.controller";
import {
  updateDiagnostic,
  deleteDiagnostic,
  addDiagnosticReview,
  approveDiagnostic,
  addDiagnosticTest,
  updateDiagnosticTest,
  deleteDiagnosticTest,
  getAllTestsByDiagnostic,
  bookDiagnosticTest,
  updateDiagnosticBooking,
  deleteDiagnosticBooking,
  addOrUpdateDiagnosticReview,
  getDiagnosticReviews,
  deleteDiagnosticReview,
  getAllDiagnostics,
  getDiagnosticStats,
} from "../../controllers/diagnostic.controller";
// Adjust the import paths below to match the actual location of your auth middleware file.
// For example, if the file is at '../../middleware/auth', use that path for both imports.
import { isAuthneticated, authorizeRoles } from "../../middleware/auth";
export const diagnosisRouter = express.Router();
// import multer from "multer";
import { parseFormData } from "../../middleware/formPaser";
import { updateMedicineShop } from "../../controllers/medicineShop.controller";
import { createAppointment } from "../../controllers/chats/appointment.controller";
import { upload } from "../../utils/multer"; // or configure for Cloudinary
import { updateAccessToken } from "../../controllers/user.controller";
import { handleProfile } from "../../utils/handler/handler.controller";

//all profileform handler
diagnosisRouter.get(
  "/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);
diagnosisRouter.post(
  "/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("diagnosis"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createDiagnosisProfile
);

//add or update router
// diaRouter.put("/update/:id", updateDiagnostic);
// diaRouter.put("/add/:id", addDiagnosticTest);
// diaRouter.put("/update/test/:id/:testId", updateDiagnosticTest);
// diaRouter.get("/getall/test/:diagnosticId", getAllTestsByDiagnostic);
// diaRouter.delete("/delete/test/:id/:testId", deleteDiagnosticTest);

// //booking diagnostic Test
// diaRouter.post("/book/test/:diagnosticId", isAuthneticated, bookDiagnosticTest);
// diaRouter.put("/booking/update/:bookingId", updateDiagnosticBooking);
// diaRouter.delete("/booking/delete/:bookingId", deleteDiagnosticBooking);

// //admin

// //add review of diagnostics

// //review system
// diaRouter.post("/review/update/:diagnosticId", addOrUpdateDiagnosticReview);

// diaRouter.get("/get/review/:diagnoticId", getDiagnosticReviews);

// diaRouter.delete(
//   "/:diagnosticId/review/:userId/:userType",
//   deleteDiagnosticReview
// );

// //anlaysis diagnostics
// diaRouter.get("/all", getAllDiagnostics);
// diaRouter.get("/stats", getDiagnosticStats);
// diaRouter.delete("/delete/:diagnosticId", deleteDiagnostic);

// // router.delete("/diagnostic/:diagnosticId/review/:userId", deleteReview);

export default diagnosisRouter;

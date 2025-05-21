import express from "express";
import { upload } from "../../utils/multer";
import {
 
  deleteCoverPageImage,
  deleteRewardPicture,
  messagess,
  trackMessageStatus,
  updateCoverPageImage,
  updateRewardPicture,
  uploadDoctorCertificates,
  uploadDoctorGallery,
  uploadDoctorRewardPicture,
  
} from "../../controllers/reports/doctor-report.controller";

export const reports = express.Router();

reports.post(
  "/upload/gallery/:doctorId",
  upload.array("coverpage", 5),
  uploadDoctorGallery
);

reports.delete("/:doctorId/publication/:pubIndex/coverpage/:imgIndex",deleteCoverPageImage);
reports.put(
  "/:doctorId/publication/:pubIndex/coverpage/:imgIndex",
  upload.single("coverpage"),
  updateCoverPageImage
);

//Rewards pictures and certificates upload 
reports.post(
  "/upload/reward/picture/:doctorId",
  upload.array("pictures", 5),
  uploadDoctorRewardPicture
);
reports.put(
  "/:doctorId/reward/:rewIndex/picture/:imgIndex",
  upload.single("pictures"),
  updateRewardPicture
);
reports.delete(
  "/:doctorId/reward/:rewIndex/picture/:imgIndex",
  deleteRewardPicture
);

reports.post(
  "/upload/certifications",
  upload.array("certifications", 5),
  uploadDoctorCertificates
);




// reports.post(
//   "/upload/awards",
//   upload.array("awards", 5),
//   uploadDoctorAwards
// );









require("dotenv").config();

export const client = require("twilio")(
  process.env.accountSid,
  process.env.authToken
);


reports.post("/hh",messagess);

reports.get("/hhs/:sid",trackMessageStatus)











export default reports;

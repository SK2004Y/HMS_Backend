import express from "express"
import { uploadReport,uploadPatientReport,uploadMultipleReports, getAllReports, getReportHistory, deletePatientReport} from "../controllers/report.controller"
import { upload } from "../utils/multer";


export const reportRouter=express.Router();

//image and pdf reports uploaded 
reportRouter.post("/upload-report", upload.single("report"), uploadReport);


//multiple files upload like .png and .jpg at same time
reportRouter.post(
  "/upload-reports",
  upload.array("reports", 5), // max 5 files
  uploadMultipleReports
);



//  Upload using patientId in URL
reportRouter.post("/upload/:patientId", upload.single("file"), uploadPatientReport);


reportRouter.get("/reports/:patientId", getAllReports);
reportRouter.get("/report-history/:patientId", getReportHistory);
reportRouter.delete("/delete-report/:patientId/:reportId", deletePatientReport);




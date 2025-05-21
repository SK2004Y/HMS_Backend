import express from "express";

import {updateDiagnostic,deleteDiagnostic,addDiagnosticReview,approveDiagnostic, addDiagnosticTest, updateDiagnosticTest, deleteDiagnosticTest, getAllTestsByDiagnostic, bookDiagnosticTest, updateDiagnosticBooking, deleteDiagnosticBooking, addOrUpdateDiagnosticReview, getDiagnosticReviews, deleteDiagnosticReview, getAllDiagnostics, getDiagnosticStats} from "../controllers/diagnostic.controller"
import { isAuthneticated } from "../middleware/auth";


export const diaRouter=express.Router();


//add or update router 
diaRouter.put("/update/:id",updateDiagnostic);
diaRouter.put("/add/:id", addDiagnosticTest);
diaRouter.put("/update/test/:id/:testId", updateDiagnosticTest);
diaRouter.get("/getall/test/:diagnosticId", getAllTestsByDiagnostic);
diaRouter.delete("/delete/test/:id/:testId", deleteDiagnosticTest);

//booking diagnostic Test
diaRouter.post("/book/test/:diagnosticId",isAuthneticated, bookDiagnosticTest);
diaRouter.put("/booking/update/:bookingId", updateDiagnosticBooking);
diaRouter.delete("/booking/delete/:bookingId", deleteDiagnosticBooking);



//admin


//add review of diagnostics

//review system 
diaRouter.post("/review/update/:diagnosticId",addOrUpdateDiagnosticReview);

diaRouter.get("/get/review/:diagnoticId", getDiagnosticReviews);

diaRouter.delete(
  "/:diagnosticId/review/:userId/:userType",
  deleteDiagnosticReview
);

//anlaysis diagnostics 
diaRouter.get("/all",getAllDiagnostics);
diaRouter.get("/stats",getDiagnosticStats);
diaRouter.delete("/delete/:diagnosticId",deleteDiagnostic)

// router.delete("/diagnostic/:diagnosticId/review/:userId", deleteReview);



export default diaRouter;
import express from "express"
import { updatePatientProfile,getPatientProfile,getallPatientProfile,deletePatientProfile, getPatientStats } from "../controllers/patient.controller"
import { isAuthneticated,authorizeRoles } from "../middleware/auth"
import { upload } from "../utils/multer";
import PatientRouter from "./patient/patient.router";
import { sendOTP, verifyOTP } from "../controllers/patient/auth.controller";


const patientRouter=express.Router();




// Send OTP to phone
patientRouter.post("/auth/send-otp", sendOTP);

// Verify OTP and login
patientRouter.post("/auth/verify-otp", verifyOTP);

//update or completed the patient profile 
patientRouter.put("/create",updatePatientProfile);

//get patient profile (individuall) 
patientRouter.get("/getsingle/:id",getPatientProfile);


//get all the  patient profile 
patientRouter.get("/getall",getallPatientProfile);

//patient stats by admin
patientRouter.get("/admin/stats", getPatientStats);



//delete  the patient profile 
patientRouter.delete("/delete/:id",deletePatientProfile);

export default patientRouter;
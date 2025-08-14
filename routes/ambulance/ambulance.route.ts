import express, { Response, Request, NextFunction } from 'express'


import { isAuthneticated, authorizeRoles, checkIsVerified } from '../../middleware/auth';

const AmbulanceRoute = express.Router();






//create doctor profile 

// doctorRoute.post('/d-create-profile',createDoctorProfile);


// import multer from "multer";
import { parseFormData } from '../../middleware/formPaser';
import { updateMedicineShop } from "../../controllers/medicineShop.controller";
import { createAppointment } from "../../controllers/chats/appointment.controller";
import { upload } from "../../utils/multer"; // or configure for Cloudinary
import { updateAccessToken } from "../../controllers/user.controller";
import { handleProfile } from "../../utils/handler/handler.controller";
import { createHospitalProfile } from '../../controllers/Hospital/profile.controller';
import { createMedicineProfile } from '../../controllers/medicine/profile.controller';
import { createAmbulanceProfile } from '../../controllers/ambulance/profile.controller';
import { sendOtp, verifyOtp } from '../../controllers/ambulance/otp.controller';
import { createAmbulanceVehicleService } from '../../controllers/ambulance/services.controller';


//all profileform handler 
AmbulanceRoute.get(
  "/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);
AmbulanceRoute.post(
  "/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("ambulance"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createAmbulanceProfile
);






//services 

AmbulanceRoute.post("/sendotp",sendOtp);
AmbulanceRoute.post("/verify",verifyOtp);



AmbulanceRoute.post("/create-service",updateAccessToken,isAuthneticated,authorizeRoles("ambulance"),checkIsVerified,createAmbulanceVehicleService);







export default AmbulanceRoute;
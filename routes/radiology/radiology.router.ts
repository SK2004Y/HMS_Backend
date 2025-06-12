import express, { Response, Request, NextFunction } from 'express'


import { isAuthneticated, authorizeRoles } from '../../middleware/auth';

const RadiologyRoute = express.Router();






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
import { createRadiologyProfile } from '../../controllers/radiology/profile.controller';
import { createRadiologyService } from '../../controllers/radiology/services.controller';


//all profileform handler 
RadiologyRoute.get(
  "/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);
RadiologyRoute.post(
  "/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("radiology"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createRadiologyProfile
);















//service radiology || pathology



RadiologyRoute.post("/create-service",updateAccessToken,isAuthneticated,createRadiologyService)

export default RadiologyRoute;
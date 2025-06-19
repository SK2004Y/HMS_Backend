import express, { Response, Request, NextFunction } from 'express'


import { isAuthneticated, authorizeRoles } from '../../middleware/auth';

const ClinicRoute = express.Router();






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
import { createClinicService } from '../../controllers/clinic/service.controller';
import { createProfessionalService } from '../../controllers/professional/professional.controller';
import { createHospitalService } from '../../controllers/Hospital/services.controller';


//all profileform handler 
ClinicRoute.get(
  "/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);
ClinicRoute.post(
  "/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("radiology"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createRadiologyProfile
);















//service radiology || pathology



ClinicRoute.post(
  "/create-service",
  updateAccessToken,
  isAuthneticated,
  upload.any(), // handles multiple image uploads under 'files' field
  createClinicService
);


ClinicRoute.post(
  "/create-service-professional",
  updateAccessToken,
  isAuthneticated,
  upload.any(), // handles multiple image uploads under 'files' field
  createProfessionalService
);



ClinicRoute.post(
  "/create-service-hospital",
  updateAccessToken,
  isAuthneticated,
  upload.any(), // handles multiple image uploads under 'files' field
 createHospitalService
);



export default ClinicRoute;
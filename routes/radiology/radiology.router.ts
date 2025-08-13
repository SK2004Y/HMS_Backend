import express, { Response, Request, NextFunction } from 'express'


import { isAuthneticated, authorizeRoles, checkIsVerified } from '../../middleware/auth';

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
import { createPathologyService } from '../../controllers/pathology/service.controller';


//all profileform handler 
RadiologyRoute.get(
  "/radiology/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);

RadiologyRoute.post(
  "/radiology/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("radiology"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createRadiologyProfile
);


//create Pathology profile
RadiologyRoute.post(
  "/pathology/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("pathology"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createRadiologyProfile
);





















//service radiology || pathology



RadiologyRoute.post(
  "/radiology/create-service",
  updateAccessToken,
  isAuthneticated,
  checkIsVerified,
  authorizeRoles("radiology"),
  upload.single("avatar"),
  createRadiologyService
);



//pathology services
RadiologyRoute.post(
  "/pathology/create-service",
  updateAccessToken,
  isAuthneticated,
  checkIsVerified,
  authorizeRoles("pathology"),
  upload.single("avatar"),
  createPathologyService
);

export default RadiologyRoute;
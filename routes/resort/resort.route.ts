import express, { Response, Request, NextFunction } from 'express'

import { isAuthneticated, authorizeRoles } from '../../middleware/auth';

import { checkIsVerified } from '../../middleware/auth';


const ResortRoute = express.Router();


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
import { createResortProfile } from '../../controllers/resort/profile.controller';
import { createResortService, createTourService, createWellnessTourService } from '../../controllers/resort/service.controller';


//all profileform handler 
ResortRoute.get(
  "/resort/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);
ResortRoute.post(
  "/resort/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("resort"),
  upload.single("avatar"),

  createResortProfile
);

//wellness tour profile creation 
ResortRoute.post(
  "/wellness/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("wellness"),
  upload.single("avatar"),

  createResortProfile
);


//services
ResortRoute.post(
  "/resort/create-service",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("resort"),
  checkIsVerified,
  upload.any(),
  createResortService
);


//tour services ||wellness Tour  services

  ResortRoute.post(
    "/resort/tour/create-service",
    updateAccessToken,
    isAuthneticated,
    authorizeRoles("wellness"),
    checkIsVerified,
    upload.any(),
    createWellnessTourService
  );



















export default ResortRoute;
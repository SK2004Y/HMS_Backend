import express, { Response, Request, NextFunction } from 'express'


import { isAuthneticated, authorizeRoles } from '../../middleware/auth';

const HospitalRoute = express.Router();






//create doctor profile 

// doctorRoute.post('/d-create-profile',createDoctorProfile);


// import multer from "multer";
import { parseFormData } from '../../middleware/formPaser';

import { createAppointment } from "../../controllers/chats/appointment.controller";
import { upload } from "../../utils/multer"; // or configure for Cloudinary
import { updateAccessToken } from "../../controllers/user.controller";
import { handleProfile } from "../../utils/handler/handler.controller";
import { createHospitalProfile } from '../../controllers/Hospital/profile.controller';
import { createHospitalService } from '../../controllers/Hospital/services.controller';


//all profileform handler 
HospitalRoute.get("/check-profile",updateAccessToken,isAuthneticated,handleProfile);
HospitalRoute.post(
  "/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("hospital"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createHospitalProfile
);












export default HospitalRoute;
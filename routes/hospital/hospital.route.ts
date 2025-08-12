import express, { Response, Request, NextFunction } from 'express'


import { isAuthneticated, authorizeRoles } from '../../middleware/auth';

const HospitalRoute = express.Router();







import { parseFormData } from '../../middleware/formPaser';

import { createAppointment } from "../../controllers/chats/appointment.controller";
import { upload } from "../../utils/multer"; // or configure for Cloudinary
import { updateAccessToken } from "../../controllers/user.controller";
import { handleProfile } from "../../utils/handler/handler.controller";
import { createHospitalProfile } from '../../controllers/Hospital/profile.controller';
import { createHospitalService } from '../../controllers/Hospital/services.controller';


//all profileform handler 
HospitalRoute.get(
  "/hospital/check-profile",
  updateAccessToken,
  isAuthneticated,
  handleProfile
);

//create hospital profile
HospitalRoute.post(
  "/hospital/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("hospital"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createHospitalProfile
);


//create Clinic profile
HospitalRoute.post(
  "/clinic/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("clinic"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createHospitalProfile
);

//create E_Clinic profile
HospitalRoute.post(
  "/E_Clinic/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("E_Clinic"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createHospitalProfile
);



//create Practitioner profile
HospitalRoute.post(
  "/practitioner/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("practitioner"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createHospitalProfile
);












export default HospitalRoute;
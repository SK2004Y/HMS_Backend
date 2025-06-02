import express, { Response, Request, NextFunction } from 'express'
import { GymProfile } from '../../modals/gym.modal.ts/profile.modal';
import { createGymProfile } from '../../controllers/gym/gym.controller';
import { isAuthneticated, authorizeRoles } from '../../middleware/auth';

const GymRoute = express.Router();






//create doctor profile 

// doctorRoute.post('/d-create-profile',createDoctorProfile);


// import multer from "multer";
import { parseFormData } from '../../middleware/formPaser';
import { updateMedicineShop } from "../../controllers/medicineShop.controller";
import { createAppointment } from "../../controllers/chats/appointment.controller";
import { upload } from "../../utils/multer"; // or configure for Cloudinary
import { updateAccessToken } from "../../controllers/user.controller";
import { handleProfile } from "../../utils/handler/handler.controller";


//all profileform handler 
GymRoute.get("/check-profile",updateAccessToken,isAuthneticated,handleProfile);
GymRoute.post(
  "/create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("gym"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createGymProfile
);


export default GymRoute;
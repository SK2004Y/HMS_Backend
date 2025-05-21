import express, { Response, Request, NextFunction } from 'express'
import { createDoctorProfile, updateDoctorProfile, getDoctorProfile, getAllDoctors, searchDoctors, toggleAvailability, deleteDoctorProfile, approveDoctor, toggleCommunication, getDoctorStats, addOrUpdateDoctorReview, getDoctorReviews, deleteDoctorReview, updateDoctorProfiles, allDoctorProfile, singleDoctorProfile, deleteDoctorProfiles } from '../controllers/doctor.controller';
import { DoctorModel } from '../modals/doctor.model';
import { isAuthneticated, authorizeRoles } from '../middleware/auth';

const doctorRoute = express.Router();






//create doctor profile 

// doctorRoute.post('/d-create-profile',createDoctorProfile);


// import multer from "multer";
import { parseFormData } from '../middleware/formPaser';
import { updateMedicineShop } from '../controllers/medicineShop.controller';
import { createAppointment } from '../controllers/chats/appointment.controller';
import { upload } from '../utils/multer'; // or configure for Cloudinary

doctorRoute.post(
  "/d-create-profile",
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createDoctorProfile
);

doctorRoute.get("/Alldoctors", allDoctorProfile)
doctorRoute.get("/single/:id",singleDoctorProfile)
doctorRoute.delete("/delete/:id",deleteDoctorProfiles)

//updateDotorProfile 
doctorRoute.put("/d-update-profile/:id", updateDoctorProfile);

doctorRoute.put("/doctor/:id", upload.single("avatar"), updateDoctorProfiles);   //682c20db51dd6435d7824fdb
//get doctor profile (individually)
doctorRoute.get('/d-getSingle-profile/:id', getDoctorProfile);

//get all doctor profile 
doctorRoute.get('/d-allDoctor-profile', getAllDoctors);

//doctor search by name and specilization or any others keywords
doctorRoute.get('/d-searchDoctors', searchDoctors);


//doctor toogle (means available or not )
doctorRoute.patch('/d-toogle-profile/:id', toggleAvailability);

doctorRoute.patch(
  "/admin/approve-doctor/:id",
  isAuthneticated,
  authorizeRoles("admin"),
  approveDoctor
);





//doctor delete profile 
doctorRoute.delete('/d-delete-profile/:id', isAuthneticated, deleteDoctorProfile);


//doctor chat/video call router
doctorRoute.patch("/d-toggle-communication/:id", toggleCommunication);


doctorRoute.patch('/d-update/:id', updateMedicineShop);


//doctor stats by admin
doctorRoute.get("/d/admin/stats", getDoctorStats);


//review routes
doctorRoute.post("/d/review/update/:doctorId", addOrUpdateDoctorReview);

doctorRoute.get("/d/get/review/:doctorId", getDoctorReviews);

doctorRoute.delete("/d/:doctorId/review/:userId/:userType", deleteDoctorReview);


doctorRoute.post("/d/appointments", createAppointment)

export default doctorRoute;
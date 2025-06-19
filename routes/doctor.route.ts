import express, { Response, Request, NextFunction } from 'express'
import { createDoctorProfile, updateDoctorProfile, getDoctorProfile, getAllDoctors, searchDoctors, toggleAvailability, deleteDoctorProfile, approveDoctor, toggleCommunication, getDoctorStats, addOrUpdateDoctorReview, getDoctorReviews, deleteDoctorReview, updateDoctorProfiles, allDoctorProfile, singleDoctorProfile, deleteDoctorProfiles } from '../controllers/doctor.controller';
import { DoctorModel } from '../modals/doctor.model';
import { isAuthneticated, authorizeRoles } from '../middleware/auth';

 export const doctorRoute = express.Router();


import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
} from "../controllers/order/order.controller";



// @route   POST /api/orders
// @desc    Create a new order
// @access  Public or Authenticated
doctorRoute.post("/create-orders", createOrder);

// @route   GET /api/orders
// @desc    Get all orders, optionally filter by userId
// @access  Public or Admin
doctorRoute.get("/get-orders", getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public or Authenticated
doctorRoute.get("/get-order/:id", getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (pending, success, failed)
// @access  Public (webhook) or Authenticated
doctorRoute.put("/get-order/:id/status", updateOrderStatus);



//create doctor profile 

// doctorRoute.post('/d-create-profile',createDoctorProfile);


// import multer from "multer";
import { parseFormData } from '../middleware/formPaser';

import { createAppointment } from '../controllers/chats/appointment.controller';
import { upload } from '../utils/multer'; // or configure for Cloudinary
import { updateAccessToken } from '../controllers/user.controller';
import { handleProfile } from '../utils/handler/handler.controller';
import { createDoctorService, deleteDoctorService, getAllDoctorServices, getDoctorServiceStats, getSingleDoctorService, toggleDoctorServiceField, updateDoctorService } from '../controllers/doctor/services.controller';
import { sendOTP, verifyOTP } from '../controllers/patient/auth.controller';
import { createPatientProfile } from '../controllers/patient/profile.controller';
import { triggerSOS } from '../controllers/patient/sosalert.controller';


//all profileform checking completed or not handler 
doctorRoute.get("/check-profile",updateAccessToken,isAuthneticated,handleProfile);
doctorRoute.post(
  "/d-create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("doctor"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createDoctorProfile
);


//patient router 

doctorRoute.post(
  "/patient-create-profile",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("patient"),
  upload.single("avatar"),
  // 👈 middleware to parse stringified JSON
  createPatientProfile
);

//Sos for patient
doctorRoute.post(
  "/trigger",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("patient"),
  triggerSOS
);



// Send OTP to phone
doctorRoute.post("/auth/send-otp", sendOTP);

// Verify OTP and login
doctorRoute.post("/auth/verify-otp", verifyOTP);


//created services
doctorRoute.post(
  "/create-service",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("doctor"),
  upload.single("image"),
  createDoctorService
);

doctorRoute.post("/create", upload.single("image"), createDoctorService);
doctorRoute.get("/allDoctorService/page",  updateAccessToken,
  isAuthneticated,
  authorizeRoles("doctor"),
 getAllDoctorServices);


doctorRoute.get("/service/:id",updateAccessToken,isAuthneticated,authorizeRoles("doctor"),getSingleDoctorService);
doctorRoute.put("/update/:id", upload.single("image"), updateDoctorService);
doctorRoute.delete("/delete/:id",updateAccessToken,isAuthneticated,authorizeRoles("doctor"), deleteDoctorService);

doctorRoute.patch(
  "/services/:id/toggle",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("doctor"),
  toggleDoctorServiceField
);




// Admin
doctorRoute.get("/admin/stats", getDoctorServiceStats);





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





//doctor stats by admin
doctorRoute.get("/d/admin/stats", getDoctorStats);


//review routes
doctorRoute.post("/d/review/update/:doctorId", addOrUpdateDoctorReview);

doctorRoute.get("/d/get/review/:doctorId", getDoctorReviews);

doctorRoute.delete("/d/:doctorId/review/:userId/:userType", deleteDoctorReview);


doctorRoute.post("/d/appointments", createAppointment)

export default doctorRoute;
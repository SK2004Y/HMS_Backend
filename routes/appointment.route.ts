import express from 'express'
import {
  createAppointment,
  getAllAppointments,
  getAppointmentsByPatient,
  cancelAppointment,
  updateAppointmentStatus,
  createMultipleAppointments
} from "../controllers/appointment.controller";


export const appointmentRouter=express.Router();









// Create a new appointment
appointmentRouter.post("/create", createAppointment);


//create multiple dates 
appointmentRouter.post("/create-multiple", createMultipleAppointments);

// Get all appointments (admin or for calendar display)
appointmentRouter.get("/all", getAllAppointments);

// Get appointments for a specific patient
appointmentRouter.get("/patient/:patientId", getAppointmentsByPatient);

// Cancel an appointment
appointmentRouter.delete("/cancel/:id", cancelAppointment);

// Update appointment status (e.g., confirmed, completed, cancelled)
appointmentRouter.put("/update-status/:id", updateAppointmentStatus);

export default appointmentRouter;

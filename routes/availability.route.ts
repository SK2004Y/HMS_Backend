import express from "express"

import { setAvailability,getAvailability,getNextAvailableSlot } from "../controllers/availability.controller"


export const availabilityRouter=express.Router();




// Set or update dentist availability
availabilityRouter.post("/set", setAvailability);

// Get availability for a specific dentist and date (query)
availabilityRouter.get("/get", getAvailability);

// Get next available slot for smart queuing
availabilityRouter.get("/next/:id", getNextAvailableSlot);
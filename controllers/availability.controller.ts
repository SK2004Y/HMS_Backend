import { Request, Response, NextFunction } from "express";
import { AvailabilityModel } from "../modals/availability.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import  ErrorHandler  from "../utils/ErrorHandler";
import { AppointmentModel } from "../modals/appointment.model";






// Create or update dentist availability
export const setAvailability = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { doctor, availableDate, timeSlots } = req.body;

    let availability = await AvailabilityModel.findOne({
      doctor,
      availableDate,
    });

    if (availability) {
      availability.timeSlots = timeSlots;
      await availability.save();
    } else {
      availability = await AvailabilityModel.create({
        doctor,
        availableDate,
        timeSlots,
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated",
      availability,
    });
  }
);

// Get availability for a dentist on a specific date
export const getAvailability = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { dentistId, date } = req.query;

    const availability = await AvailabilityModel.findOne({
      dentistId,
      date,
    });

    if (!availability) {
      return next(new ErrorHandler("No availability found", 404));
    }

    res.status(200).json({
      success: true,
      availableSlots: availability.timeSlots,
    });
  }
);

// Get next available slot (Smart Queue logic)
export const getNextAvailableSlot = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const dentistId = req.params.id;

    const upcomingSlots = await AvailabilityModel.find({
      dentistId,
      date: { $gte: new Date() },
      availableSlots: { $exists: true, $ne: [] },
    })
      .sort({ date: 1 }) // Sort by soonest date
      .limit(1);

    if (!upcomingSlots.length) {
      return next(new ErrorHandler("No upcoming slots available", 404));
    }

    const nextSlot = {
      date: upcomingSlots[0].availableDate.toISOString().split("T")[0],
      time: upcomingSlots[0].timeSlots[0],
    };

    res.status(200).json({
      success: true,
      nextAvailable: nextSlot,
    });
  }
);

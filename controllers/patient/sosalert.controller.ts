// controllers/sosController.ts

import { Request, Response, NextFunction } from "express";
import Twilio from "twilio";
import { PatientProfile } from "../../modals/patient.modal/profile.modal";
import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import ErrorHandler from "../../utils/ErrorHandler";
import { DoctorProfile } from "../../modals/doctor.modal/profile.modal";

// Initialize Twilio client (if you want to actually send SMS)
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER!;
const twilioClient = Twilio(accountSid, authToken);

/**
 * @desc    Trigger SOS: fetches emergency contacts and (optionally) sends SMS alerts.
 * @route   POST /api/sos/trigger
 * @access  Private (must be authenticated)
 */
export const triggerSOS = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the current user's ID from your auth middleware
    console.log(`sos hitted data`,req.body)
    const userId = req.body.userId;
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    // 2) Lookup the Patient profile by userId
    const patient = await PatientProfile.findOne( {userId} );
    if (!patient) {
      return next(new ErrorHandler("Patient profile not found", 404));
    }

    // 3) Extract emergency contacts
    const contacts = patient.emergencyContacts;
    if (!contacts?.length) {
      return next(new ErrorHandler("No emergency contacts defined", 400));
    }

    // 4) Compose an alert message (could include location from req.body)
    const { latitude, longitude } = req.body;
    const mapsLink =
      latitude && longitude
        ? `https://maps.google.com/?q=${latitude},${longitude}`
        : "Location not provided";
    const message = `🚨 SOS Alert! 🚨\n${patient.name} needs help.\nLocation: ${mapsLink}`;

    console.log(`message map is `,message)
    // 5) (Optional) Send SMS via Twilio to each contact
    const dispatchResults = await Promise.all(
      contacts.map((c) =>
        twilioClient.messages.create({
          to: c.phone,
          from: twilioFrom,
          body: `Hi ${c.name},\n${message}`,
        })
      )
    );

    // 6) Return success + list of numbers messaged
    res.status(200).json({
      success: true,
      sentTo: dispatchResults.map((m) => m.to),
      message: "SOS notifications dispatched",
    });
  }
);









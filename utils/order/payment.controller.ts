import { AmbulanceVehicle } from "../../modals/ambulance.modal/services.modal";
import { ClinicService } from "../../modals/clinic.modal/service.modal";
import { HospitalService } from "../../modals/hospital.modal/services.modal";
import { PathologyService } from "../../modals/pathology.modal/services.modal";
import { ProfessionalService } from "../../modals/professional.modal/service.modal";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import { ResortService } from "../../modals/resort.modal/services.modal";
import express, { NextFunction, Request, Response } from "express";
import { instance } from "../razopay";
import bookingModal from "../../modals/booking/booking.modal";
import crypto from "crypto";






const SERVICE_MODELS: Record<string, any> = {
  radiology: RadiologyService,
  pathology: PathologyService,
  clinic: ClinicService,
  hospital: HospitalService,
  professional: ProfessionalService,
  resort: ResortService,
  ambulance: AmbulanceVehicle,
};

export const bookService = async (req: Request, res: Response) => {
  try {
    const { userId, serviceId, serviceType, selectedFields } = req.body;

    const Model = SERVICE_MODELS[serviceType.toLowerCase()];
    if (!Model)
      return res.status(400).json({ message: "Invalid service type" });

    const service = await Model.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    console.log(`booking query hitted `, req.body);
    // Calculate price
    let total = 0;
    const breakdown: any = {};

    if (selectedFields.roomType === "AC") {
      total += service.acroomPrice;
      breakdown.room = service.acroomPrice;
    } else if (selectedFields.roomType === "Non-AC") {
      total += service.nonAcroomPrice;
      breakdown.room = service.nonAcroomPrice;
    }

    if (selectedFields.mode) {
      const modePrice = service[`${selectedFields.mode}ServicePrice`];
      if (modePrice) {
        total += modePrice;
        breakdown.mode = modePrice;
      }
    }

    if (selectedFields.report && service.reports?.length > 0) {
      const reportEntry = service.reports.find((r: any) =>
        r.reportsname.includes(selectedFields.report)
      );
      if (reportEntry) {
        const fee = reportEntry.courierfee || reportEntry.persornfee || 0;
        total += fee;
        breakdown.report = fee;
      }
    }

    // Save booking in DB
    const newBooking = new bookingModal({
      userId,
      serviceId,
      serviceType,
      serviceName: service.serviceName,
      selectedFields,
      breakdown,
      totalAmount: total,
      paymentStatus: "pending",
    });

    const savedBooking = await newBooking.save();

    res.status(200).json({
      bookingId: savedBooking._id,
      message: "Booking created, proceed to payment",
      totalAmount: total,
    });
  } catch (error) {
    console.error("Booking Error", error);
    res.status(500).json({ message: "Server error" });
  }
};






//create razorpayorderid
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const booking = await bookingModal.findById(bookingId);
    console.log("🔥 booking fetched:", {
      bookingId: booking._id,
      userId: booking.userId,
      serviceType: booking.serviceType,
      amount: booking.totalAmount,
      paymentId: "", // Leave empty until payment verification
      paymentStatus: "pending",
      
    });
    console.log(`booking id `,booking);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create Razorpay order
    const razorpayOrder = await instance.orders.create({
      amount: booking.totalAmount * 100, // ₹ → paise
      currency: "INR",
      receipt: `receipt_order_${bookingId}`,
    });

    // Save razorpay order ID in booking
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    // **Log** to verify you have everything


    // ✅ Create entry in `Order` collection
    const responseI = await bookingModal.create({
      bookingId: booking._id,
      userId: booking.userId,
      serviceType: booking.serviceType,
      amount: booking.totalAmount,
      razorpayOrderId: razorpayOrder.id,
      paymentId: "", // Leave empty until payment verification
      paymentStatus: "pending",
    });

    return res.status(200).json({
      success: true,
      bookingId,
      razorpayOrderId: razorpayOrder.id,
      amount: booking.totalAmount,
      currency: "INR",
    });
  } catch (err) {
    console.error("❌ Error creating Razorpay Order:", err);
    res.status(500).json({ message: "Server error while creating order" });
  }
};


export const verifyPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;


  console.log(`verify controller called data `,req.body);

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const booking = await bookingModal.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.paymentStatus = "paid";
  booking.razorpayPaymentId = razorpay_payment_id;
  booking.paidAt = new Date();
  await booking.save();

  res.status(200).json({ message: "Payment verified successfully", booking });
};
  






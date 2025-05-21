
import { Request, Response } from "express";
import { OfficeModel } from "../modals/office.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { instance } from "../utils/razopay";
import crypto from "crypto";

export const viewAssignedOfficeCharge = CatchAsyncError(
  async (req: Request, res: Response) => {
    const dentistId = req.user._id;

    const office = await OfficeModel.findOne({ assignedDentist: dentistId });
    if (!office)
      return res
        .status(404)
        .json({ success: false, message: "No office assigned" });

    res.status(200).json({
      success: true,
      office: {
        name: office.name,
        type: office.officetype,
        charge: office.charge,
        paymentStatus: office.paymentStatus,
        paymentDate: office.paymentDate,
      },
    });
  }
);

export const initiatePayment = CatchAsyncError(
  async (req: Request, res: Response) => {
    const dentistId = req.user._id;
    const office = await OfficeModel.findOne({ assignedDentist: dentistId });
    if (!office)
      return res
        .status(404)
        .json({ success: false, message: "Office not assigned" });

    const options = {
      amount: office.charge * 100, // amount in paisa
      currency: "INR",
      receipt: `receipt_office_${dentistId}`,
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  }
);

export const verifyPayment = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const office = await OfficeModel.findOneAndUpdate(
      { paymentStatus: "pending", assignedDentist: req.user._id },
      { paymentStatus: "paid", paymentDate: new Date() },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Payment verified and updated", office });
  }
);

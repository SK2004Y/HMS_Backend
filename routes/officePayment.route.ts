import express from "express";
import {
  viewAssignedOfficeCharge,
  initiatePayment,
  verifyPayment,
} from "../controllers/office-payment.controller";
import { isAuthneticated } from "../middleware/auth";

const routerPayment = express.Router();

routerPayment.use(isAuthneticated);

routerPayment.get("/view", viewAssignedOfficeCharge);
routerPayment.post("/pay/initiate", initiatePayment);
routerPayment.post("/pay/verify", verifyPayment);

export default routerPayment;

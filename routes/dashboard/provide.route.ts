// routes/orderRoutes.ts
import express, {Router} from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
} from "../../controllers/order/order.controller";
import userRouter from "../user.route";
import { deleteServiceTypeandId, searchServicesByType, toggleAvailability, updateServiceTypeandId, viewSingleServiceTypeandId } from "../../controllers/dashboard/allservices.controller";

const dashboardRouter=express.Router();



dashboardRouter.get("/all",searchServicesByType);



dashboardRouter.put("/update/:serviceType/:serviceId",updateServiceTypeandId);


dashboardRouter.delete("/delete/:serviceType/:serviceId", deleteServiceTypeandId);



dashboardRouter.get("/view/:serviceType/:serviceId",viewSingleServiceTypeandId);


dashboardRouter.patch("/toogle/:serviceType/:serviceId", toggleAvailability);


export default dashboardRouter;

// routes/orderRoutes.ts
import express, {Router} from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
} from "../../controllers/order/order.controller";
import userRouter from "../user.route";
import { deleteServiceTypeandId, getAllServicesQuery,  toggleAvailability, updateServiceTypeandId, viewSingleServiceTypeandId } from "../../controllers/dashboard/allservices.controller";

const dashboardRouter=express.Router();







dashboardRouter.get("/allServices", getAllServicesQuery);



dashboardRouter.put("/update/:serviceType/:serviceId",updateServiceTypeandId);


dashboardRouter.delete("/delete/:serviceType/:serviceId", deleteServiceTypeandId);



dashboardRouter.get("/view/:serviceType/:serviceId",viewSingleServiceTypeandId);


dashboardRouter.patch("/toogle/:serviceType/:serviceId", toggleAvailability);


export default dashboardRouter;

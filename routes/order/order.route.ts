// routes/orderRoutes.ts
import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
} from "../../controllers/order/order.controller";

import doctorRoute from "../doctor.route";

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public or Authenticated
doctorRoute.post("/create", createOrder);

// @route   GET /api/orders
// @desc    Get all orders, optionally filter by userId
// @access  Public or Admin
doctorRoute.get("/", getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public or Authenticated
doctorRoute.get("/:id", getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (pending, success, failed)
// @access  Public (webhook) or Authenticated
doctorRoute.put("/:id/status", updateOrderStatus);

export default doctorRoute;

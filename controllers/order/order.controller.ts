// controllers/orderController.ts
import { Request, Response } from "express";
import { OrderModel, IOrder } from "../../modals/order/order.modal";
import { sendNotification } from "../../socket/event.handle";

// Create a new order (payment initiation)
export const createOrder = async (req: Request, res: Response) => {
  try {
    // Extract relevant fields from the request body
    const { userId, serviceType, amount, paymentId, razorpayOrderId } =
      req.body;
      console.log(`order created hit body data `,req.body);

    // Build the order object
    const newOrder: Partial<IOrder> = {
      userId,
      serviceType,
      amount,
      paymentId,
      razorpayOrderId,
      status: "pending", // default status when order is created
    };

    // Save to database
    const savedOrder = await OrderModel.create(newOrder);
    return res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};




// Get all orders (for admin or user-specific if filtered)
export const getOrders = async (req: Request, res: Response) => {
  try {
    // Optional: filter by userId passed as query param
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update order status (e.g. from webhook callback)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentId } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status, paymentId },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (status === "success") {
      const payload = {
        type: "payment",
        title: "Payment Successful",
        message: `Paid ₹${order.amount} for ${order.serviceType}. Order ID: ${order._id}`,
        icon: "payment_success_icon.png",
        data: { orderId: order._id, paymentId },
      };
      const res=await sendNotification(order.userId.toString(), payload);
      console.log(`notification send to `,res)
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


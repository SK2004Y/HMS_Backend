import express, {Request,Response} from "express"
import { Router } from "express"
import { isAuthneticated } from "../../middleware/auth"
import { updateAccessToken } from "../../controllers/user.controller"
import {  AllDoctorServices,    getAllServices, getServiceByTypeAndId, searchServices, searchServicesClinic, searchServicesRadiology, searchServicesResort,  SingleDoctorService,  } from "../../controllers/patient/service.controller"
import { get } from "http"

import { NotificationModel } from "../../modals/notifications/notification.modal"
import { sendNotification } from "../../socket/event.handle"
import { bookService, verifyPayment } from "../../utils/order/payment.controller"
import {createRazorpayOrder}  from "../../utils/order/payment.controller"

const PatientRouter= express.Router()


//doctor 
PatientRouter.get("/doctorServices/page",getAllServices);





// PatientRouter.get("/Services/pages", DoctorallServices);
PatientRouter.get("/doctorService/p", searchServices);


//radiology services 
PatientRouter.get("/radiologyServices/p",searchServicesRadiology);




PatientRouter.get("/resortServices/p",searchServicesResort);


//clinic 
PatientRouter.get("/clinicServices/p",searchServicesClinic);





PatientRouter.get("/doctorService/:id",SingleDoctorService);


//booking 
PatientRouter.post("/book",updateAccessToken,isAuthneticated, bookService);

PatientRouter.post(
  "/create-order",
  updateAccessToken,
  isAuthneticated,
  createRazorpayOrder
);



PatientRouter.post("/verify-order",updateAccessToken,isAuthneticated,verifyPayment);















//view single services details 
PatientRouter.get(
  "/services/view/:serviceType/:id",
  getServiceByTypeAndId
);


PatientRouter.get("/notification/:userId", async (req:Request, res:Response) => {
  const { userId } = req.params;
  const notifications = await NotificationModel.find({ userId }).sort({
    createdAt: -1,
  });
  
  res.json(notifications);

});

PatientRouter.put(
  "/notification/markAllRead/:userId",
  async (req: Request, res: Response) => {

    
    await NotificationModel.updateMany(
      { userId: req.params.userId },
      { isRead: true }
    );
    res.sendStatus(200);
  }
);



PatientRouter.post("/noti/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;
  const message = req.body.message;

  if (!userId || !message) {
    return res.status(400).json({ error: "ID and message are required" });
  }

  try {
    // 1️⃣ Persist to MongoDB
    const notificationDoc = await NotificationModel.create({
      userId,
      message,
      // isRead defaults to false, createdAt defaults to now
    });

    // 2️⃣ Emit over Socket.IO
    sendNotification(userId, message);

    // 3️⃣ Return the saved document
    return res.status(201).json({
      message: "Notification created and sent",
      notification: notificationDoc,
    });
  } catch (err) {
    console.error("Error creating or sending notification:", err);
    return res
      .status(500)
      .json({ error: "Failed to create/send notification" });
  }
});








export default PatientRouter;
import express, {Request,Response} from "express"
import { Router } from "express"
import { isAuthneticated } from "../../middleware/auth"
import { updateAccessToken } from "../../controllers/user.controller"
import { AllDiagnosticServices, AllDoctorServices, AllGymervices, AllHospitalServices, AllPharmacyServices, AllRadiologyServices, AllResortervices, DoctorallServices, DoctorallServicess, getAllServices, searchServices, SingleDiagnosticService, SingleDoctorService, SingleGymService, SingleHospitalService, SinglePharmacyService, SingleRadiologyService, SingleResortService } from "../../controllers/patient/service.controller"
import { get } from "http"

import { NotificationModel } from "../../modals/notifications/notification.modal"
import { sendNotification } from "../../socket/event.handle"

const PatientRouter= express.Router()


//doctor 
PatientRouter.get("/doctorServices/page",getAllServices);





PatientRouter.get("/Services/pages", DoctorallServices);
PatientRouter.get("/doctorService/p", searchServices);
PatientRouter.get("/doctorService/:id",SingleDoctorService);


//diagnosis 
PatientRouter.get("/diagnosisServices", AllDiagnosticServices);
PatientRouter.get("/diagnosisService/:id", SingleDiagnosticService);



//Hospital
PatientRouter.get("/hospitalServices", AllHospitalServices);
PatientRouter.get("/hospitalService/:id", SingleHospitalService);

//Radiology
PatientRouter.get("/radiologyervices", AllRadiologyServices);
PatientRouter.get("/radiologyService/:id", SingleRadiologyService);



//Pharmacy 
PatientRouter.get("/pharmacyServices", AllPharmacyServices);
PatientRouter.get("/pharmacyService/:id", SinglePharmacyService);



//Resort 
PatientRouter.get("/resortServices",AllResortervices);
PatientRouter.get("/DoctorService/:id", SingleResortService);

//gym

PatientRouter.get("/gymServices", AllGymervices);
PatientRouter.get("/DoctorService/:id", SingleGymService);






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
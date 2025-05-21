import express from "express"
import {
  updateMedicineShop,
  createMedicineShop,
  getSingleMedicineShop,
  getAllMedicineShops,
  getallShops,
  addMedicineService,
  updateMedicineService,
  allMedicineService,
  deleteMedicineService,
  addOrUpdateMedicineReview,
  getMedicineReviews,
  deleteMedicineReview,
} from "../controllers/medicineShop.controller";
import { authorizeRoles, isAuthneticated } from "../middleware/auth";
import { approveMedicineShop, deleteMedicineShopAdmin, getAllMedicineShopsAdmin } from "../services/medicineShop.service";
import { getMedicineShopStats } from "../controllers/admin/medicineShopAdmin.controller";


 export const medicineRouter=express.Router();


// medicineShopRoutes.ts
// medicineRouter.post("/medicine-service/add/:id", addmedicineService);
// medicineRouter.put("/medicine-service/update/:medicineServiceId", updatemedicineService);
// medicineRouter.delete("/medicine-service/delete/:medicineServiceId", deletemedicineService);



medicineRouter.patch('/update/:id',updateMedicineShop);
medicineRouter.get('/getsearch',getAllMedicineShops);  //search ,filter, pagination
medicineRouter.get("/getall", getallShops);
medicineRouter.get("/getsingle/:id", getSingleMedicineShop);



//admin 
// Admin protected routes
medicineRouter.get(
  "/allshops",
  isAuthneticated,
  // authorizeRoles("admin"),
  getAllMedicineShopsAdmin
);
medicineRouter.put(
  "/shopapprove/:id",
  isAuthneticated,
//   authorizeRoles("admin"),
  approveMedicineShop
);


medicineRouter.get(
  "/medicine-shop/stats",
  isAuthneticated,
  authorizeRoles("admin"),
  getMedicineShopStats
);



medicineRouter.delete(
  "/shopdelete/:id",
  isAuthneticated,
//   authorizeRoles("admin"),
  deleteMedicineShopAdmin
);



//medicineServices 

medicineRouter.post("/service/add/:id", addMedicineService);
medicineRouter.put(
  "/service/update/:id",
  updateMedicineService
);

medicineRouter.get("/service/all", allMedicineService);
medicineRouter.delete(
  "/service/delete/:medicineServiceId",
  deleteMedicineService
);


//review routes
medicineRouter.post("/review/update/:medicineId", addOrUpdateMedicineReview);

medicineRouter.get("/get/review/:medicineId", getMedicineReviews);

medicineRouter.delete(
  "/:medicineId/review/:userId/:userType",
  deleteMedicineReview
);

export default medicineRouter;
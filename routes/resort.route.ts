// routes/resort.routes.ts
import express from "express";
import {
 
  updateResort,
  getMyResort,
  deleteResort,
  listResorts,
  addOrUpdateResortReview,
  getResortReviews,
  deleteResortReview,
  getAllResortsAdmin,
  approveResort,
  deleteResortAdmin,
  getResortStats,
} from "../controllers/resort.controller";
// import {
//   getAllResortsAdmin,
//   approveResort,
//   deleteResortAdmin,
//   getResortStats,
// } from "../controllers/adminResort.controller";
import { isAuthneticated, authorizeRoles } from "../middleware/auth";

export const resortRouter = express.Router();

// Public / User routes
// resortRouter.post(
//   "/create",
 
//   createResort
// );
resortRouter.put(
  "/update/:id",

  isAuthneticated,updateResort
);
resortRouter.get(
  "/mine",
isAuthneticated,
  getMyResort
);
resortRouter.delete(
  "/delete/:id",
 isAuthneticated,
  deleteResort
);
resortRouter.get("/all", listResorts);

// Admin routes
resortRouter.get(
  "/admin/all",

  getAllResortsAdmin
);
resortRouter.patch(
  "/admin/approve/:resortId",

  approveResort
);
resortRouter.get("/admin/stats", getResortStats);
resortRouter.delete(
  "/admin/delete/:resortId",
  deleteResortAdmin
);



//review system 
resortRouter.post("/review/update/:resortId",addOrUpdateResortReview);

resortRouter.get("/get/review/:resortId", getResortReviews);

resortRouter.delete(
  "/:resortId/review/:userId/:userType",
  deleteResortReview
);






export default resortRouter;

import express from "express";
import {
 
  getProfileTypeSummary,
  getProfilesByTypeWithFilters,
} from "../../controllers//admin/medicineShopAdmin.controller";
import { isAuthneticated, authorizeRoles, checkIsVerified, getServiceProviderStatS, getTotalServices } from "../../middleware/auth";
import { approveUser, deapproveUser, deleteUser, getAllUsers, getUserWithProfile } from "../../controllers/admin/admin.controller";
import { updateAccessToken } from "../../controllers/user.controller";

const adminrouter = express.Router();



//all users
//  isAuthneticated,
//    authorizeRoles("admin"),
   adminrouter.get(
     "/users",
     updateAccessToken,
     isAuthneticated,
     authorizeRoles("admin"),
     getAllUsers
   );
adminrouter.get(
  "/users/:userId",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("admin"),
  getUserWithProfile
);



adminrouter.put(
  "/approve/:userId",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("admin"),
  approveUser
);
adminrouter.put(
  "/deapprove/:userId",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("admin"),
  deapproveUser
);
adminrouter.delete(
  "/delete/:userId",
  updateAccessToken,
  isAuthneticated,
  authorizeRoles("admin"),
  deleteUser
);





//payment summary stats
adminrouter.get("/payment-summary",isAuthneticated,getServiceProviderStatS)
adminrouter.get("/total-service",isAuthneticated,getTotalServices)
export default adminrouter;

import express from "express";
import {
 
  getProfileTypeSummary,
  getProfilesByTypeWithFilters,
} from "../../controllers//admin/medicineShopAdmin.controller";
import { isAuthneticated, authorizeRoles } from "../../middleware/auth";
import { approveUser, deapproveUser, deleteUser, getAllUsers, getUserWithProfile } from "../../controllers/admin/admin.controller";

const adminrouter = express.Router();



//all users
//  isAuthneticated,
//    authorizeRoles("admin"),
   adminrouter.get(
     "/users",
    //  isAuthneticated,
    //  authorizeRoles("admin"),
     getAllUsers
   );
adminrouter.get("/users/:userId", getUserWithProfile);



adminrouter.put("/approve/:userId",approveUser);
adminrouter.put("/deapprove/:userId",deapproveUser);
adminrouter.delete("/delete/:userId",deleteUser);
export default adminrouter;

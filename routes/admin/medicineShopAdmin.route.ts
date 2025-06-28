import express from "express";
import {
  getAllMedicineShopsAdmin,
  approveMedicineShop,
  deleteMedicineShopAdmin,
  getProfileTypeSummary,
  getProfilesByTypeWithFilters,
} from "../../controllers//admin/medicineShopAdmin.controller";
import { isAuthneticated, authorizeRoles } from "../../middleware/auth";

const adminrouter = express.Router();

adminrouter.get("/get-overview",getProfileTypeSummary);
adminrouter.get("/get-specific",getProfilesByTypeWithFilters);


export default adminrouter;

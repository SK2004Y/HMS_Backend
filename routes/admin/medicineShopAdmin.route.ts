import express from "express";
import {
  getAllMedicineShopsAdmin,
  approveMedicineShop,
  deleteMedicineShopAdmin,
} from "../../controllers//admin/medicineShopAdmin.controller";
import { isAuthneticated, authorizeRoles } from "../../middleware/auth";

const router = express.Router();

// Admin protected routes
router.get(
  "/medicine-shops",
  isAuthneticated,
  // authorizeRoles("admin"),
  getAllMedicineShopsAdmin
);
router.put(
  "/medicine-shop/approve/:id",
  isAuthneticated,
  authorizeRoles("admin"),
  approveMedicineShop
);




router.delete(
  "/medicine-shop/:id",
  isAuthneticated,
  authorizeRoles("admin"),
  deleteMedicineShopAdmin
);



export default router;

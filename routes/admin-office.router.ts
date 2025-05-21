import express from "express";
import {
  createOffice,
  updateOffice,
  assignDentist,
  freeOffice,
} from "../controllers/admin-office.controller";

const officeRouter = express.Router();

// Middleware to verify admin
import { isAuthneticated ,authorizeRoles} from "../middleware/auth";

// Protect all routes below:
officeRouter.use(isAuthneticated);

officeRouter.post("/create", authorizeRoles("admin"), createOffice);
officeRouter.put("/edit/:officeId", authorizeRoles("admin"), updateOffice);
officeRouter.patch("/assign", authorizeRoles("admin"), assignDentist);
officeRouter.patch("/free/:officeId", authorizeRoles("admin"), freeOffice);

export default officeRouter;

import express from "express";
import {
  fieldLogin,
  fieldMe,
  fieldTrackingUpdate,
  fieldCheckIn,
  fieldCheckOut,
} from "../controllers/fieldController.js";
import { protectEmployee } from "../middleware/employeeAuth.js";

const router = express.Router();

router.post("/login", fieldLogin);

router.use(protectEmployee);

router.get("/me", fieldMe);
router.post("/tracking/update", fieldTrackingUpdate);
router.post("/attendance/check-in", fieldCheckIn);
router.post("/attendance/check-out", fieldCheckOut);

export default router;

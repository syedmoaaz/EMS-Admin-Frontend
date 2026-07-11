import express from "express";
import {
  getLiveTracking,
  getTrackingStats,
  getEmployeeTracking,
  updateTracking,
} from "../controllers/trackingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/update", (req, res) =>
  res.status(405).json({ success: false, message: "Use POST /api/tracking/update" })
);
router.post("/update", updateTracking);

router.use(protect);

router.get("/live", getLiveTracking);
router.get("/stats", getTrackingStats);
router.get("/:employeeId", getEmployeeTracking);

export default router;

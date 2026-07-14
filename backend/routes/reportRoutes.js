import express from "express";
import {
  getAttendanceReport,
  getBranchReport,
  getTrackingReport,
  getReportsSummary,
} from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getReportsSummary);
router.get("/attendance", getAttendanceReport);
router.get("/branches", getBranchReport);
router.get("/tracking", getTrackingReport);

export default router;

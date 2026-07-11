import express from "express";
import {
  getAttendance,
  getAttendanceStats,
  getAttendanceHistory,
  createAttendance,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getAttendanceStats);
router.get("/history/:employeeId", getAttendanceHistory);
router.route("/").get(getAttendance).post(createAttendance);

export default router;

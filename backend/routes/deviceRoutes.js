import express from "express";
import {
  getDeviceMe,
  postHeartbeat,
  ingestAttendance,
} from "../controllers/deviceController.js";
import { protectDeviceSecret } from "../middleware/deviceAuth.js";

const router = express.Router();

router.use(protectDeviceSecret);

router.get("/me", getDeviceMe);
router.post("/heartbeat", postHeartbeat);
router.post("/attendance/ingest", ingestAttendance);

export default router;

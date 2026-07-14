import express from "express";
import {
  getAlerts,
  getUnreadCount,
  syncAlerts,
  markAlertRead,
  markAllRead,
  dismissAlert,
} from "../controllers/alertController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAlerts);
router.get("/unread-count", getUnreadCount);
router.post("/sync", syncAlerts);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markAlertRead);
router.patch("/:id/dismiss", dismissAlert);

export default router;

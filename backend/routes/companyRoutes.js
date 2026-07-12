import express from "express";
import {
  createCompany,
  loginCompany,
  getCompanyProfile,
  updateCompany,
  changePassword,
} from "../controllers/companyController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createCompany);
router.post("/login", loginCompany);

router.get("/profile", protect, getCompanyProfile);
router.put("/update", protect, updateCompany);
router.put("/change-password", protect, changePassword);

export default router;

import express from "express";
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branchController.js";
import {
  getBranchDevice,
  generateBranchDeviceSecret,
  revokeBranchDeviceSecret,
} from "../controllers/branchDeviceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getBranches).post(createBranch);

router.get("/:id/device", getBranchDevice);
router.post("/:id/device-secret", generateBranchDeviceSecret);
router.delete("/:id/device-secret", revokeBranchDeviceSecret);

router.route("/:id").get(getBranch).put(updateBranch).delete(deleteBranch);

export default router;

import BranchDevice from "../models/BranchDevice.js";
import Branch from "../models/Branch.js";
import Company from "../models/Company.js";
import { hashDeviceSecret } from "../utils/deviceSecret.js";

/**
 * Authenticates branch agents via X-Device-Secret.
 * Sets req.companyId, req.branchId, req.branchDevice, req.company, req.branch.
 * Never trusts branch/company from the request body.
 */
export const protectDeviceSecret = async (req, res, next) => {
  try {
    const secret =
      req.headers["x-device-secret"] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!secret || !String(secret).trim()) {
      res.status(401);
      throw new Error("Not authorized, missing device secret");
    }

    const deviceSecretHash = hashDeviceSecret(String(secret).trim());
    const branchDevice = await BranchDevice.findOne({ deviceSecretHash });

    if (!branchDevice) {
      res.status(401);
      throw new Error("Not authorized, invalid device secret");
    }

    const [company, branch] = await Promise.all([
      Company.findById(branchDevice.company),
      Branch.findById(branchDevice.branch),
    ]);

    if (!company || company.status !== "Active") {
      res.status(401);
      throw new Error("Not authorized, company inactive");
    }

    if (!branch || branch.status === "Inactive") {
      res.status(401);
      throw new Error("Not authorized, branch inactive");
    }

    req.companyId = String(branchDevice.company);
    req.branchId = String(branchDevice.branch);
    req.branchDevice = branchDevice;
    req.company = company;
    req.branch = branch;

    next();
  } catch (error) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(error);
  }
};

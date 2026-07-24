import Employee from "../models/Employee.js";
import Branch from "../models/Branch.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import {
  resolveEmployeeImage,
  destroyEmployeeImage,
} from "../utils/cloudinaryImage.js";
import {
  isValidDevicePin,
  isValidEmployeeId,
  nextDevicePin,
  nextEmployeeIdForCity,
  normalizeCityCode,
  normalizeDevicePin,
  normalizeEmployeeId,
} from "../utils/employeeIds.js";
import {
  formatShiftTiming,
  getCompanyScheduleDefaults,
  normalizeWorkScheduleInput,
} from "../utils/workSchedule.js";
import {
  assertFieldPasswordRules,
  hashFieldPassword,
  isFieldRole,
} from "../utils/fieldPassword.js";
import { sanitizeEmployee } from "../models/Employee.js";

const verifyBranchBelongsToCompany = async (branchId, companyId, res) => {
  const branch = await Branch.findOne({ _id: branchId, company: companyId });

  if (!branch) {
    res.status(400);
    throw new Error("Branch not found or does not belong to your company");
  }

  return branch;
};

const mapEmployees = (list) => list.map((e) => sanitizeEmployee(e));

// @route  GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const { search, branch, designation, status } = req.query;
  const query = companyQuery(req);

  if (branch && branch !== "all") query.branch = branch;
  if (designation && designation !== "all") query.designation = designation;
  if (status && status !== "all") query.status = status;

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { name: regex },
      { employeeId: regex },
      { devicePin: regex },
      { phone: regex },
    ];
  }

  const employees = await Employee.find(query)
    .populate("branch", "name city cityCode")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: employees.length,
    data: mapEmployees(employees),
  });
});

// @route  GET /api/employees/:id
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne(
    companyQuery(req, { _id: req.params.id })
  ).populate("branch", "name city cityCode");

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.json({ success: true, data: sanitizeEmployee(employee) });
});

// @route  POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const branch = await verifyBranchBelongsToCompany(
    req.body.branch,
    req.companyId,
    res
  );

  let employeeId = normalizeEmployeeId(req.body.employeeId);
  let devicePin = normalizeDevicePin(req.body.devicePin);

  if (!employeeId) {
    employeeId = await nextEmployeeIdForCity(
      req.companyId,
      branch.cityCode || normalizeCityCode(branch.code?.split("-")[0])
    );
  }

  if (!isValidEmployeeId(employeeId)) {
    res.status(400);
    throw new Error(
      "Employee ID must look like CITY-n (e.g. THT-1). No leading zeros."
    );
  }

  if (!devicePin) {
    devicePin = await nextDevicePin(req.companyId);
  }

  if (!isValidDevicePin(devicePin)) {
    res.status(400);
    throw new Error(
      "Device PIN must be digits only with no leading zero (K50 rule)."
    );
  }

  const role = req.body.role || "Office Staff";
  let plainPassword = "";

  if (isFieldRole(role)) {
    try {
      plainPassword = assertFieldPasswordRules(req.body.password, {
        required: true,
      });
    } catch (err) {
      res.status(400);
      throw err;
    }
  }

  const image = await resolveEmployeeImage(req.body.image);
  const defaults = await getCompanyScheduleDefaults(req.companyId);
  const workSchedule = normalizeWorkScheduleInput(
    req.body.workSchedule,
    defaults
  );
  const shiftTiming =
    formatShiftTiming(workSchedule.start, workSchedule.end) ||
    String(req.body.shiftTiming || "").trim();

  const {
    password: _pw,
    fieldPassword: _fp,
    hasFieldPassword: _h,
    ...rest
  } = req.body;

  try {
    const employee = await Employee.create({
      ...rest,
      image,
      workSchedule,
      shiftTiming,
      employeeId,
      devicePin,
      role,
      company: req.companyId,
      ...(plainPassword
        ? { fieldPassword: plainPassword }
        : { fieldPassword: "", hasFieldPassword: false }),
    });

    res.status(201).json({ success: true, data: sanitizeEmployee(employee) });
  } catch (err) {
    if (err?.code === 11000) {
      res.status(400);
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      throw new Error(
        field === "devicePin"
          ? "Device PIN already in use for this company"
          : "Employee ID already in use for this company"
      );
    }
    throw err;
  }
});

// @route  PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  if (req.body.branch) {
    await verifyBranchBelongsToCompany(req.body.branch, req.companyId, res);
  }

  const existing = await Employee.findOne(
    companyQuery(req, { _id: req.params.id })
  ).select("+fieldPassword");

  if (!existing) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const {
    password: rawPassword,
    fieldPassword: _ignoreFp,
    hasFieldPassword: _ignoreH,
    ...rest
  } = req.body;

  const updates = { ...rest };

  if (updates.employeeId !== undefined) {
    updates.employeeId = normalizeEmployeeId(updates.employeeId);
    if (!isValidEmployeeId(updates.employeeId)) {
      res.status(400);
      throw new Error(
        "Employee ID must look like CITY-n (e.g. THT-1). No leading zeros."
      );
    }
  }

  if (updates.devicePin !== undefined) {
    updates.devicePin = normalizeDevicePin(updates.devicePin);
    if (!isValidDevicePin(updates.devicePin)) {
      res.status(400);
      throw new Error(
        "Device PIN must be digits only with no leading zero (K50 rule)."
      );
    }
  }

  if (updates.image !== undefined) {
    updates.image = await resolveEmployeeImage(updates.image);

    if (
      updates.image &&
      existing.image &&
      updates.image !== existing.image
    ) {
      await destroyEmployeeImage(existing.image);
    }

    if (!updates.image && existing.image) {
      await destroyEmployeeImage(existing.image);
    }
  }

  if (updates.workSchedule !== undefined) {
    const defaults = await getCompanyScheduleDefaults(req.companyId);
    const merged = normalizeWorkScheduleInput(
      {
        ...(existing.workSchedule?.toObject?.() || existing.workSchedule || {}),
        ...updates.workSchedule,
      },
      defaults
    );
    updates.workSchedule = merged;
    updates.shiftTiming = formatShiftTiming(merged.start, merged.end);
  }

  const nextRole = updates.role || existing.role;

  if (rawPassword !== undefined && String(rawPassword).trim()) {
    if (!isFieldRole(nextRole)) {
      res.status(400);
      throw new Error("Passwords are only for Order Taker / Dispatcher.");
    }
    let plain;
    try {
      plain = assertFieldPasswordRules(rawPassword, { required: true });
    } catch (err) {
      res.status(400);
      throw err;
    }
    updates.fieldPassword = await hashFieldPassword(plain);
    updates.hasFieldPassword = true;
  } else if (updates.role && !isFieldRole(nextRole)) {
    updates.fieldPassword = "";
    updates.hasFieldPassword = false;
  }

  try {
    const employee = await Employee.findOneAndUpdate(
      companyQuery(req, { _id: req.params.id }),
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: sanitizeEmployee(employee) });
  } catch (err) {
    if (err?.code === 11000) {
      res.status(400);
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      throw new Error(
        field === "devicePin"
          ? "Device PIN already in use for this company"
          : "Employee ID already in use for this company"
      );
    }
    throw err;
  }
});

// @route  DELETE /api/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndDelete(
    companyQuery(req, { _id: req.params.id })
  );

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  await destroyEmployeeImage(employee.image);

  res.json({ success: true, message: "Employee deleted" });
});

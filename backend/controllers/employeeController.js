import Employee from "../models/Employee.js";
import Branch from "../models/Branch.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";

const verifyBranchBelongsToCompany = async (branchId, companyId, res) => {
  const branch = await Branch.findOne({ _id: branchId, company: companyId });

  if (!branch) {
    res.status(400);
    throw new Error("Branch not found or does not belong to your company");
  }

  return branch;
};

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
      { phone: regex },
    ];
  }

  const employees = await Employee.find(query)
    .populate("branch", "name city")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: employees.length, data: employees });
});

// @route  GET /api/employees/:id
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne(
    companyQuery(req, { _id: req.params.id })
  ).populate("branch", "name city");

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.json({ success: true, data: employee });
});

// @route  POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  await verifyBranchBelongsToCompany(req.body.branch, req.companyId, res);

  const employee = await Employee.create({
    ...req.body,
    company: req.companyId,
  });

  res.status(201).json({ success: true, data: employee });
});

// @route  PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  if (req.body.branch) {
    await verifyBranchBelongsToCompany(req.body.branch, req.companyId, res);
  }

  const employee = await Employee.findOneAndUpdate(
    companyQuery(req, { _id: req.params.id }),
    req.body,
    { new: true, runValidators: true }
  );

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  res.json({ success: true, data: employee });
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

  res.json({ success: true, message: "Employee deleted" });
});

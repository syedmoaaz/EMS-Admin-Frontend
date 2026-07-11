import Employee from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc   Get all employees (filters: search, branch, designation, status)
// @route  GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const { search, branch, designation, status } = req.query;

  const query = {};

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

// @desc   Get single employee
// @route  GET /api/employees/:id
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate(
    "branch",
    "name city"
  );
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json({ success: true, data: employee });
});

// @desc   Create employee
// @route  POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json({ success: true, data: employee });
});

// @desc   Update employee
// @route  PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json({ success: true, data: employee });
});

// @desc   Delete employee
// @route  DELETE /api/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json({ success: true, message: "Employee deleted" });
});

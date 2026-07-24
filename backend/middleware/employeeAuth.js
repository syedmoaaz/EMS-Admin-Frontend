import jwt from "jsonwebtoken";
import Employee, { FIELD_EMPLOYEE_TYPES } from "../models/Employee.js";
import Company from "../models/Company.js";

/** Auth for field Android app — employee JWT only. */
export const protectEmployee = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "employee" || !decoded.employeeId || !decoded.companyId) {
      res.status(401);
      throw new Error("Not authorized, employee token required");
    }

    const company = await Company.findById(decoded.companyId);
    if (!company || company.status !== "Active") {
      res.status(401);
      throw new Error("Not authorized, company not found or inactive");
    }

    const employee = await Employee.findOne({
      _id: decoded.employeeId,
      company: decoded.companyId,
    }).populate("branch", "name city cityCode");

    if (!employee || employee.status !== "Active") {
      res.status(401);
      throw new Error("Not authorized, employee not found or inactive");
    }

    if (!FIELD_EMPLOYEE_TYPES.includes(employee.role)) {
      res.status(403);
      throw new Error("Only field employees can use this app");
    }

    req.companyId = decoded.companyId;
    req.company = company;
    req.employee = employee;
    req.employeeId = employee._id;

    next();
  } catch (error) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(error);
  }
};

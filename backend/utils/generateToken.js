import jwt from "jsonwebtoken";

export const generateToken = (userId, companyId) =>
  jwt.sign({ type: "company", userId, companyId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/** JWT for field app (Order Taker / Dispatcher). */
export const generateEmployeeToken = ({
  employeeId,
  companyId,
  role,
  employeeMongoId,
}) =>
  jwt.sign(
    {
      type: "employee",
      employeeId: employeeMongoId,
      employeeCode: employeeId,
      companyId,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

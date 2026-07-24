import bcrypt from "bcryptjs";
import { FIELD_EMPLOYEE_TYPES } from "../models/Employee.js";

export const isFieldRole = (role) => FIELD_EMPLOYEE_TYPES.includes(role);

export const hashFieldPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const assertFieldPasswordRules = (password, { required = false } = {}) => {
  const value = String(password || "");
  if (!value) {
    if (required) {
      throw new Error("Password is required for Order Taker / Dispatcher.");
    }
    return null;
  }
  if (value.length < 6) {
    throw new Error("Field app password must be at least 6 characters.");
  }
  return value;
};

import jwt from "jsonwebtoken";

export const generateToken = (userId, companyId) =>
  jwt.sign({ userId, companyId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

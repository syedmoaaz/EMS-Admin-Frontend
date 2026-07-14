import Company from "../models/Company.js";
import Settings from "../models/Settings.js";
import { generateToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

const formatCompanyResponse = (company) => ({
  id: company._id,
  companyId: company._id,
  companyName: company.companyName,
  name: company.ownerName,
  ownerName: company.ownerName,
  email: company.email,
  phone: company.phone,
  status: company.status,
});

// @desc   Register a new company with owner account
// @route  POST /api/company/create
export const createCompany = asyncHandler(async (req, res) => {
  const { companyName, ownerName, email, phone, password } = req.body;

  if (!companyName || !ownerName || !email || !password) {
    res.status(400);
    throw new Error("Company name, owner name, email and password are required");
  }

  const existing = await Company.findOne({ email: email.trim().toLowerCase() });

  if (existing) {
    res.status(400);
    throw new Error("A company with this email already exists");
  }

  const company = await Company.create({
    companyName,
    ownerName,
    email,
    phone,
    password,
  });

  await Settings.create({ company: company._id });

  const token = generateToken(company._id.toString(), company._id.toString());

  res.status(201).json({
    success: true,
    token,
    user: formatCompanyResponse(company),
  });
});

// @desc   Company owner login
// @route  POST /api/company/login
export const loginCompany = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const company = await Company.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!company || !(await company.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (company.status !== "Active") {
    res.status(403);
    throw new Error("Company account is inactive");
  }

  const token = generateToken(company._id.toString(), company._id.toString());

  res.json({
    success: true,
    token,
    user: formatCompanyResponse(company),
  });
});

// @desc   Get logged-in company profile
// @route  GET /api/company/profile
export const getCompanyProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: formatCompanyResponse(req.company),
  });
});

// @desc   Update company profile
// @route  PUT /api/company/update
export const updateCompany = asyncHandler(async (req, res) => {
  const { companyName, ownerName, phone } = req.body;

  const company = await Company.findByIdAndUpdate(
    req.companyId,
    { companyName, ownerName, phone },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user: formatCompanyResponse(company),
  });
});

// @desc   Change company owner password
// @route  PUT /api/company/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const company = await Company.findById(req.companyId).select("+password");

  if (!(await company.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  company.password = newPassword;
  await company.save();

  res.json({ success: true, message: "Password updated successfully" });
});

// @desc   Reset password with admin secret (forgot password)
// @route  POST /api/company/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  const { email, username, newPassword } = req.body;
  const loginId = (email || username || "").trim().toLowerCase();

  if (!process.env.ADMIN_SECRET) {
    res.status(500);
    throw new Error("ADMIN_SECRET is not configured on the server");
  }

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    res.status(403);
    throw new Error("Invalid admin secret");
  }

  if (!loginId || !newPassword) {
    res.status(400);
    throw new Error("Email/username and new password are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const company = await Company.findOne({ email: loginId }).select("+password");

  if (!company) {
    res.status(404);
    throw new Error("Company account not found");
  }

  company.password = newPassword;
  await company.save();

  res.json({
    success: true,
    message: "Password reset successfully",
    email: company.email,
  });
});

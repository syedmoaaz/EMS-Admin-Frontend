import Branch from "../models/Branch.js";
import Employee from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import { normalizeCityCode } from "../utils/employeeIds.js";

const resolveCityCode = (body) => {
  if (body.cityCode) return normalizeCityCode(body.cityCode);
  if (body.code) {
    const fromCode = normalizeCityCode(String(body.code).split("-")[0]);
    if (fromCode.length >= 2) return fromCode;
  }
  if (body.city) {
    const fromCity = normalizeCityCode(body.city).slice(0, 3);
    if (fromCity.length >= 2) return fromCity;
  }
  return "";
};

// @route  GET /api/branches
export const getBranches = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = companyQuery(req);

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { name: regex },
      { city: regex },
      { cityCode: regex },
      { manager: regex },
    ];
  }

  const branches = await Branch.find(query).sort({ createdAt: -1 }).lean();

  const withCounts = await Promise.all(
    branches.map(async (branch) => ({
      ...branch,
      employees: await Employee.countDocuments(
        companyQuery(req, { branch: branch._id, status: "Active" })
      ),
    }))
  );

  res.json({ success: true, count: withCounts.length, data: withCounts });
});

// @route  GET /api/branches/:id
export const getBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne(
    companyQuery(req, { _id: req.params.id })
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  res.json({ success: true, data: branch });
});

// @route  POST /api/branches
export const createBranch = asyncHandler(async (req, res) => {
  const cityCode = resolveCityCode(req.body);
  if (!cityCode || cityCode.length < 2) {
    res.status(400);
    throw new Error("City code is required (2–5 letters, e.g. THT, KHI)");
  }

  const branch = await Branch.create({
    ...req.body,
    cityCode,
    company: req.companyId,
  });

  res.status(201).json({ success: true, data: branch });
});

// @route  PUT /api/branches/:id
export const updateBranch = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (
    updates.cityCode !== undefined ||
    updates.code !== undefined ||
    updates.city !== undefined
  ) {
    const cityCode = resolveCityCode({
      ...updates,
      cityCode: updates.cityCode,
    });
    if (cityCode) updates.cityCode = cityCode;
  }

  if (updates.cityCode !== undefined && updates.cityCode.length < 2) {
    res.status(400);
    throw new Error("City code is required (2–5 letters, e.g. THT, KHI)");
  }

  const branch = await Branch.findOneAndUpdate(
    companyQuery(req, { _id: req.params.id }),
    updates,
    { new: true, runValidators: true }
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  res.json({ success: true, data: branch });
});

// @route  DELETE /api/branches/:id
export const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findOneAndDelete(
    companyQuery(req, { _id: req.params.id })
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  res.json({ success: true, message: "Branch deleted" });
});

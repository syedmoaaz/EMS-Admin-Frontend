import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc   Login user
// @route  POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    res.status(400);
    throw new Error("Please provide User ID and password");
  }

  const user = await User.findOne({
    userId: userId.trim().toUpperCase(),
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid User ID or password");
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      userId: user.userId,
      name: user.name,
      role: user.role,
      branch: user.branch,
    },
  });
});

// @desc   Get current logged-in user
// @route  GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      userId: req.user.userId,
      name: req.user.name,
      role: req.user.role,
      branch: req.user.branch,
    },
  });
});

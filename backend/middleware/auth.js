import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

export const protect = async (req, res, next) => {
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

    if (!decoded.companyId) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }

    const company = await Company.findById(decoded.companyId);

    if (!company || company.status !== "Active") {
      res.status(401);
      throw new Error("Not authorized, company not found or inactive");
    }

    req.companyId = decoded.companyId;
    req.userId = decoded.userId;
    req.company = company;

    next();
  } catch (error) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(error);
  }
};

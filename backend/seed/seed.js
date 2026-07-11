import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Branch from "../models/Branch.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Tracking from "../models/Tracking.js";
import User from "../models/User.js";

import {
  branches,
  employees,
  attendance,
  tracking,
  users,
} from "./data.js";

dotenv.config();

const today = new Date().toISOString().slice(0, 10);

const run = async () => {
  try {
    await connectDB();

    console.log("Clearing existing collections...");
    await Promise.all([
      Branch.deleteMany(),
      Employee.deleteMany(),
      Attendance.deleteMany(),
      Tracking.deleteMany(),
      User.deleteMany(),
    ]);

    // Branches
    const branchIdMap = {};
    for (const b of branches) {
      const { ref, ...doc } = b;
      const created = await Branch.create(doc);
      branchIdMap[ref] = created._id;
    }
    console.log(`Seeded ${branches.length} branches`);

    // Employees
    const employeeIdMap = {};
    for (const e of employees) {
      const { ref, branchRef, ...doc } = e;
      const created = await Employee.create({
        ...doc,
        branch: branchIdMap[branchRef],
      });
      employeeIdMap[ref] = created._id;
    }
    console.log(`Seeded ${employees.length} employees`);

    // Attendance (today)
    for (const a of attendance) {
      const { employeeRef, ...doc } = a;
      await Attendance.create({
        ...doc,
        employee: employeeIdMap[employeeRef],
        date: today,
      });
    }
    console.log(`Seeded ${attendance.length} attendance records`);

    // Tracking
    for (const t of tracking) {
      const { employeeRef, ...doc } = t;
      await Tracking.create({
        ...doc,
        employee: employeeIdMap[employeeRef],
        lastUpdated: Date.now(),
      });
    }
    console.log(`Seeded ${tracking.length} tracking records`);

    // Users (password hashing handled by pre-save hook -> use create per doc)
    for (const u of users) {
      const { branchRef, ...doc } = u;
      await User.create({
        ...doc,
        branch: branchRef ? branchIdMap[branchRef] : null,
      });
    }
    console.log(`Seeded ${users.length} users`);

    console.log("\nSeed complete. Login credentials:");
    users.forEach((u) => console.log(`  ${u.userId} / ${u.password} (${u.role})`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

run();

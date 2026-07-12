import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Company from "../models/Company.js";
import Settings from "../models/Settings.js";
import Branch from "../models/Branch.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Tracking from "../models/Tracking.js";

import { company, branches, employees, attendance, tracking } from "./data.js";

dotenv.config();

const today = new Date().toISOString().slice(0, 10);

const run = async () => {
  try {
    await connectDB();

    console.log("Clearing existing collections...");
    await Promise.all([
      Company.deleteMany(),
      Settings.deleteMany(),
      Branch.deleteMany(),
      Employee.deleteMany(),
      Attendance.deleteMany(),
      Tracking.deleteMany(),
    ]);

    const createdCompany = await Company.create(company);
    const companyId = createdCompany._id;
    console.log(`Seeded company: ${company.companyName}`);

    await Settings.create({ company: companyId });
    console.log("Seeded default settings");

    const branchIdMap = {};
    for (const b of branches) {
      const { ref, ...doc } = b;
      const created = await Branch.create({ ...doc, company: companyId });
      branchIdMap[ref] = created._id;
    }
    console.log(`Seeded ${branches.length} branches`);

    const employeeIdMap = {};
    const employeeBranchMap = {};
    for (const e of employees) {
      const { ref, branchRef, ...doc } = e;
      const created = await Employee.create({
        ...doc,
        company: companyId,
        branch: branchIdMap[branchRef],
      });
      employeeIdMap[ref] = created._id;
      employeeBranchMap[ref] = branchIdMap[branchRef];
    }
    console.log(`Seeded ${employees.length} employees`);

    for (const a of attendance) {
      const { employeeRef, ...doc } = a;
      await Attendance.create({
        ...doc,
        company: companyId,
        employee: employeeIdMap[employeeRef],
        branch: employeeBranchMap[employeeRef],
        date: today,
      });
    }
    console.log(`Seeded ${attendance.length} attendance records`);

    for (const t of tracking) {
      const { employeeRef, ...doc } = t;
      await Tracking.create({
        ...doc,
        company: companyId,
        employee: employeeIdMap[employeeRef],
        lastUpdated: Date.now(),
      });
    }
    console.log(`Seeded ${tracking.length} tracking records`);

    console.log("\nSeed complete. Login credentials:");
    console.log(`  Email:    ${company.email}`);
    console.log(`  Password: ${company.password}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

run();

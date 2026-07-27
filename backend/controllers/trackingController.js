import Tracking from "../models/Tracking.js";
import FieldSession from "../models/FieldSession.js";
import Employee from "../models/Employee.js";
import { FIELD_EMPLOYEE_TYPES } from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import { toDateKey } from "../services/attendanceIngestService.js";
import { formatDistanceKm } from "../utils/geoDistance.js";

/** No GPS ping for this long → treat as Offline (field app default interval ~30s). */
const STALE_ONLINE_MS = 2.5 * 60 * 1000;

const isStale = (record) => {
  if (!record?.lastUpdated) return true;
  return Date.now() - new Date(record.lastUpdated).getTime() > STALE_ONLINE_MS;
};

/** Mark stale online rows offline in DB; return records for API response. */
const reconcileStaleOnline = async (records) => {
  const staleIds = [];
  for (const r of records) {
    if (r.online && isStale(r)) staleIds.push(r._id);
  }

  if (staleIds.length) {
    await Tracking.updateMany(
      { _id: { $in: staleIds } },
      {
        $set: {
          online: false,
          status: "Offline",
          lastUpdated: Date.now(),
        },
      }
    );
  }

  return records.map((r) => {
    if (!staleIds.some((id) => String(id) === String(r._id))) return r;
    const obj = typeof r.toObject === "function" ? r.toObject() : { ...r };
    obj.online = false;
    obj.status = "Offline";
    return obj;
  });
};

/** Attach today's field distance + open-session flag to tracking rows. */
const enrichWithFieldDistance = async (companyId, records) => {
  const today = toDateKey(new Date());
  const employeeIds = records
    .map((r) => r.employee?._id || r.employee)
    .filter(Boolean);

  if (!employeeIds.length) return records;

  const sessions = await FieldSession.find({
    company: companyId,
    employee: { $in: employeeIds },
    date: today,
  }).select("employee distanceKm status checkIn checkOut closedReason");

  const byEmp = new Map();
  for (const s of sessions) {
    const key = String(s.employee);
    const cur = byEmp.get(key) || {
      distanceKm: 0,
      fieldSessionOpen: false,
      fieldCheckIn: null,
      fieldCheckOut: null,
      fieldClosedReason: null,
    };
    cur.distanceKm += Number(s.distanceKm) || 0;
    if (s.status === "Open") {
      cur.fieldSessionOpen = true;
      cur.fieldCheckIn = s.checkIn;
      cur.fieldCheckOut = "--";
      cur.fieldClosedReason = null;
    } else if (!cur.fieldSessionOpen) {
      cur.fieldCheckIn = cur.fieldCheckIn || s.checkIn;
      cur.fieldCheckOut = s.checkOut;
      cur.fieldClosedReason = s.closedReason || cur.fieldClosedReason;
    }
    byEmp.set(key, cur);
  }

  return records.map((r) => {
    const obj = typeof r.toObject === "function" ? r.toObject() : { ...r };
    const empId = String(obj.employee?._id || obj.employee || "");
    const info = byEmp.get(empId) || {
      distanceKm: 0,
      fieldSessionOpen: false,
      fieldCheckIn: null,
      fieldCheckOut: null,
      fieldClosedReason: null,
    };
    obj.todayDistanceKm = info.distanceKm;
    obj.todayDistanceLabel = formatDistanceKm(info.distanceKm);
    obj.fieldSessionOpen = info.fieldSessionOpen;
    obj.fieldCheckIn = info.fieldCheckIn;
    obj.fieldCheckOut = info.fieldCheckOut;
    obj.fieldClosedReason = info.fieldClosedReason;
    return obj;
  });
};

// @route  GET /api/tracking/live
export const getLiveTracking = asyncHandler(async (req, res) => {
  const records = await Tracking.find(companyQuery(req)).populate({
    path: "employee",
    select: "name image designation role branch department",
    populate: { path: "branch", select: "name" },
  });

  let data = await reconcileStaleOnline(records);
  data = await enrichWithFieldDistance(req.companyId, data);

  res.json({ success: true, count: data.length, data });
});

// @route  GET /api/tracking/stats
export const getTrackingStats = asyncHandler(async (req, res) => {
  let records = await Tracking.find(companyQuery(req));
  records = await reconcileStaleOnline(records);

  res.json({
    success: true,
    data: {
      online: records.filter((r) => r.online).length,
      moving: records.filter((r) => r.status === "Moving").length,
      stationary: records.filter((r) => r.status === "Stationary").length,
      offline: records.filter(
        (r) => r.status === "Offline" || r.status === "GPS Disabled"
      ).length,
    },
  });
});

// @route  GET /api/tracking/:employeeId
export const getEmployeeTracking = asyncHandler(async (req, res) => {
  let record = await Tracking.findOne(
    companyQuery(req, { employee: req.params.employeeId })
  ).populate("employee", "name image designation role department");

  if (!record) {
    res.status(404);
    throw new Error("Tracking record not found");
  }

  const [reconciled] = await reconcileStaleOnline([record]);
  const [enriched] = await enrichWithFieldDistance(req.companyId, [reconciled]);
  record = enriched;

  res.json({ success: true, data: record });
});

// @route  POST /api/tracking/update
export const updateTracking = asyncHandler(async (req, res) => {
  const { employee, company: bodyCompany } = req.body;

  const employeeDoc = await Employee.findOne({ _id: employee });

  if (!employeeDoc) {
    res.status(404);
    throw new Error("Employee not found");
  }

  if (!FIELD_EMPLOYEE_TYPES.includes(employeeDoc.role)) {
    res.status(400);
    throw new Error("Only field employees can have GPS tracking data");
  }

  const companyId = req.companyId || bodyCompany || employeeDoc.company;

  if (req.companyId && employeeDoc.company.toString() !== req.companyId.toString()) {
    res.status(403);
    throw new Error("Employee does not belong to your company");
  }

  const record = await Tracking.findOneAndUpdate(
    { company: companyId, employee },
    { ...req.body, company: companyId, lastUpdated: Date.now() },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: record });
});

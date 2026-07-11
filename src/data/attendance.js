import { employees, ROLES } from "./employees";
import { getBranchName } from "./branches";

export const attendanceRecords = [
  {
    employeeId: 1,
    checkIn: "09:02 AM",
    checkOut: "06:10 PM",
    hours: "9h 08m",
    method: "Biometric",
    status: "Present",
  },
  {
    employeeId: 2,
    checkIn: "08:55 AM",
    checkOut: "06:00 PM",
    hours: "9h 05m",
    method: "Biometric",
    status: "Present",
  },
  {
    employeeId: 3,
    checkIn: "09:18 AM",
    checkOut: "--",
    hours: "Working",
    method: "Biometric",
    status: "Late",
  },
  {
    employeeId: 4,
    checkIn: "08:31 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    employeeId: 5,
    checkIn: "08:45 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    employeeId: 6,
    checkIn: "08:05 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    employeeId: 7,
    checkIn: "09:00 AM",
    checkOut: "06:15 PM",
    hours: "9h 15m",
    method: "Biometric",
    status: "Present",
  },
  {
    employeeId: 8,
    checkIn: "09:25 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    employeeId: 9,
    checkIn: "--",
    checkOut: "--",
    hours: "--",
    method: "--",
    status: "Absent",
  },
  {
    employeeId: 10,
    checkIn: "--",
    checkOut: "--",
    hours: "--",
    method: "--",
    status: "Absent",
  },
  {
    employeeId: 11,
    checkIn: "08:40 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    employeeId: 12,
    checkIn: "08:58 AM",
    checkOut: "06:05 PM",
    hours: "9h 07m",
    method: "Biometric",
    status: "Present",
  },
  {
    employeeId: 13,
    checkIn: "08:35 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    employeeId: 14,
    checkIn: "08:10 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
];

export const getAttendanceList = () =>
  attendanceRecords.map((record) => {
    const employee = employees.find((e) => e.id === record.employeeId);

    return {
      id: record.employeeId,
      image: employee?.image,
      name: employee?.name,
      employeeId: employee?.employeeId,
      branch: getBranchName(employee?.branchId),
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      hours: record.hours,
      method: record.method,
      status: record.status,
    };
  });

export const getAttendanceStats = () => {
  const records = attendanceRecords;

  return {
    present: records.filter((r) => r.status === "Present").length,
    absent: records.filter((r) => r.status === "Absent").length,
    late: records.filter((r) => r.status === "Late").length,
    onLeave: 2,
    working: records.filter((r) => r.status === "Working").length,
  };
};

export const getOfficeAttendanceCount = () =>
  attendanceRecords.filter((record) => {
    const employee = employees.find((e) => e.id === record.employeeId);
    return (
      employee?.role === ROLES.OFFICE_STAFF &&
      (record.status === "Present" || record.status === "Late")
    );
  }).length;

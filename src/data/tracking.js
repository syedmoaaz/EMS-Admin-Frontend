import { getFieldEmployees } from "./employees";
import { getBranchName } from "./branches";

export const trackingData = [
  {
    employeeId: 4,
    status: "Moving",
    battery: "78%",
    speed: "24 km/h",
    location: "Clifton, Karachi",
    updated: "10 sec ago",
    online: true,
  },
  {
    employeeId: 5,
    status: "Stationary",
    battery: "63%",
    speed: "0 km/h",
    location: "DHA Phase 6, Karachi",
    updated: "18 sec ago",
    online: true,
  },
  {
    employeeId: 6,
    status: "Moving",
    battery: "85%",
    speed: "32 km/h",
    location: "Shahrah-e-Faisal, Karachi",
    updated: "8 sec ago",
    online: true,
  },
  {
    employeeId: 8,
    status: "Moving",
    battery: "71%",
    speed: "18 km/h",
    location: "Model Town, Lahore",
    updated: "12 sec ago",
    online: true,
  },
  {
    employeeId: 9,
    status: "GPS Disabled",
    battery: "51%",
    speed: "--",
    location: "--",
    updated: "2 mins ago",
    online: false,
  },
  {
    employeeId: 11,
    status: "Offline",
    battery: "34%",
    speed: "--",
    location: "--",
    updated: "15 mins ago",
    online: false,
  },
  {
    employeeId: 13,
    status: "Moving",
    battery: "92%",
    speed: "28 km/h",
    location: "Jinnah Road, Faisalabad",
    updated: "6 sec ago",
    online: true,
  },
  {
    employeeId: 14,
    status: "Stationary",
    battery: "67%",
    speed: "0 km/h",
    location: "Kohinoor City, Faisalabad",
    updated: "22 sec ago",
    online: true,
  },
];

export const getLiveEmployees = () =>
  trackingData
    .map((track) => {
      const employee = getFieldEmployees().find(
        (e) => e.id === track.employeeId
      );

      if (!employee) return null;

      return {
        id: employee.id,
        image: employee.image,
        name: employee.name,
        designation: employee.designation,
        role: employee.role,
        branch: getBranchName(employee.branchId),
        status: track.status,
        battery: track.battery,
        speed: track.speed,
        location: track.location,
        updated: track.updated,
        online: track.online,
      };
    })
    .filter(Boolean);

export const getTrackingStats = () => {
  const live = getLiveEmployees();

  return {
    online: live.filter((e) => e.online).length,
    moving: live.filter((e) => e.status === "Moving").length,
    stationary: live.filter((e) => e.status === "Stationary").length,
    offline: live.filter(
      (e) => e.status === "Offline" || e.status === "GPS Disabled"
    ).length,
  };
};

export const getActiveOrderTakers = () =>
  getLiveEmployees().filter(
    (e) => e.role === "Order Taker" && e.online && e.status !== "GPS Disabled"
  ).length;

export const getActiveDispatchers = () =>
  getLiveEmployees().filter(
    (e) => e.role === "Dispatcher" && e.online && e.status !== "GPS Disabled"
  ).length;

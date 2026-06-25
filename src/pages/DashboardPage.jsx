import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  Radio,
  TriangleAlert,
} from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";


const stats = [
  {
    title: "Total Employees",
    value: 128,
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    change: "+4",
    changeText: "this month",
    positive: true,
  },

  {
    title: "Present Today",
    value: 102,
    icon: UserCheck,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    change: "+3.2%",
    changeText: "vs yesterday",
    positive: true,
  },

  {
    title: "Absent Today",
    value: 18,
    icon: UserX,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    change: "+2",
    changeText: "vs yesterday",
    positive: false,
  },

  {
    title: "Late Arrivals",
    value: 8,
    icon: Clock3,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    change: "-1",
    changeText: "vs yesterday",
    positive: true,
  },

  {
    title: "Active Field Employees",
    value: 24,
    icon: Radio,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    change: "+6",
    changeText: "live now",
    positive: true,
  },

  {
    title: "Active Alerts",
    value: 5,
    icon: TriangleAlert,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    change: "+2",
    changeText: "needs action",
    positive: false,
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-blue-600 font-medium text-sm">
          OVERVIEW
        </p>

        <h1 className="text-3xl font-bold mt-1">
          Good Morning, Admin
        </h1>

        <p className="text-gray-500 mt-1">
          Here's what's happening across all branches today.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl p-5 border shadow-sm"
          >
            <h3 className="text-sm text-gray-500">
              {item.title}
            </h3>

            <h2 className="text-3xl font-bold mt-3">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl h-80 p-5 border shadow-sm">
          <h2 className="font-semibold text-lg">
            Attendance Overview
          </h2>
        </div>

        <div className="bg-white rounded-xl h-80 p-5 border shadow-sm">
          <h2 className="font-semibold text-lg">
            Branch Performance
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl h-80 p-5 border shadow-sm">
          <h2 className="font-semibold text-lg">
            Live Employees
          </h2>
        </div>

        <div className="bg-white rounded-xl h-80 p-5 border shadow-sm">
          <h2 className="font-semibold text-lg">
            Critical Alerts
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-xl h-80 p-5 border shadow-sm">
        <h2 className="font-semibold text-lg">
          Live Map
        </h2>
      </div>
    </div>
  );
};

export default DashboardPage;
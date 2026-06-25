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
    value: "128",
  },
  {
    title: "Present Today",
    value: "102",
  },
  {
    title: "Absent Today",
    value: "18",
  },
  {
    title: "Active Employees",
    value: "24",
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
import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  Radio,
  TriangleAlert,
} from "lucide-react";

import StatsCard from "../components/StatsCard";


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
     
<div className="flex items-center justify-between">
  <div>
    <p className="text-blue-600 font-semibold text-sm uppercase">
      Overview
    </p>

    <h1 className="text-[34px] font-bold text-slate-900 mt-1">
      Good Morning, Saad
    </h1>

    <p className="text-slate-500 mt-1">
      Here's what's happening across all branches today.
    </p>
  </div>

  <div className="flex items-center gap-3">
    <button className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 transition">
      Export Report
    </button>

    <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
      + Add Employee
    </button>
  </div>
</div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
  {stats.map((item) => (
    <StatsCard
      key={item.title}
      {...item}
    />
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
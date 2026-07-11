import {
  UserCheck,
  UserX,
  Clock3,
  Plane,
} from "lucide-react";

import AttendanceStatsCard from "../components/attendance/AttendanceStatsCard";
import AttendanceFilters from "../components/attendance/AttendanceFilters";
import AttendanceTable from "../components/attendance/AttendanceTable";
import { getAttendanceStats } from "../data";

const AttendancePage = () => {
  const attendanceStats = getAttendanceStats();

  const stats = [
    {
      title: "Present Today",
      value: attendanceStats.present,
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      change: "+3.2%",
      positive: true,
    },
    {
      title: "Absent Today",
      value: attendanceStats.absent,
      icon: UserX,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      change: "+2",
      positive: false,
    },
    {
      title: "Late Arrivals",
      value: attendanceStats.late,
      icon: Clock3,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      change: "-1",
      positive: true,
    },
    {
      title: "On Leave",
      value: attendanceStats.onLeave,
      icon: Plane,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      change: "0",
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-600 text-sm font-semibold uppercase">
            Attendance Management
          </p>

          <h1 className="text-3xl font-bold mt-1">Attendance</h1>

          <p className="text-slate-500 mt-1">
            Monitor today's attendance across all branches.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl font-medium">
          Refresh Live
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((item) => (
          <AttendanceStatsCard key={item.title} {...item} />
        ))}
      </div>

      <AttendanceFilters />
      <AttendanceTable />
    </div>
  );
};

export default AttendancePage;

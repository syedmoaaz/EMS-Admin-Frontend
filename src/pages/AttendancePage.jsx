import { useCallback, useEffect, useMemo, useState } from "react";
import { UserCheck, UserX, Clock3, Plane } from "lucide-react";
import toast from "react-hot-toast";

import AttendanceStatsCard from "../components/attendance/AttendanceStatsCard";
import AttendanceFilters from "../components/attendance/AttendanceFilters";
import AttendanceTable from "../components/attendance/AttendanceTable";
import AttendanceHistoryDrawer from "../components/attendance/AttendanceHistoryDrawer";
import * as attendanceService from "../services/attendanceService";
import * as branchService from "../services/branchService";

const today = () => new Date().toISOString().slice(0, 10);
const PAGE_SIZE = 10;

const AttendancePage = () => {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState(today());
  const [branches, setBranches] = useState([]);
  const [records, setRecords] = useState([]);
  const [statsData, setStatsData] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyRecord, setHistoryRecord] = useState(null);
  const [page, setPage] = useState(1);

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await branchService.getBranches();
      setBranches(data || []);
    } catch {
      setBranches([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { date };
      if (search.trim()) params.search = search.trim();
      if (branch !== "all") params.branch = branch;
      if (method !== "all") params.method = method;
      if (status !== "all") params.status = status;

      const [listRes, statsRes] = await Promise.all([
        attendanceService.getAttendance(params),
        attendanceService.getAttendanceStats({ date }),
      ]);

      setRecords(listRes.data || []);
      setStatsData(
        statsRes.data || { present: 0, absent: 0, late: 0, onLeave: 0 }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [search, branch, method, status, date]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [loadData, search]);

  useEffect(() => {
    setPage(1);
  }, [search, branch, method, status, date]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return records.slice(start, start + PAGE_SIZE);
  }, [records, page]);

  const exportCsv = () => {
    if (!records.length) {
      toast.error("No records to export.");
      return;
    }

    const headers = [
      "Employee",
      "Employee ID",
      "Branch",
      "Check In",
      "Check Out",
      "Hours",
      "Method",
      "Status",
      "Date",
    ];

    const rows = records.map((record) => {
      const emp = record.employee || {};
      const branchName =
        record.branch?.name || emp.branch?.name || "";
      return [
        emp.name || "",
        emp.employeeId || "",
        branchName,
        record.checkIn || "",
        record.checkOut || "",
        record.hours || "",
        record.method || "",
        record.status || "",
        record.date || date,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const stats = [
    {
      title: "Present Today",
      value: statsData.present,
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      change: String(statsData.present),
      positive: true,
    },
    {
      title: "Absent Today",
      value: statsData.absent,
      icon: UserX,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      change: String(statsData.absent),
      positive: false,
    },
    {
      title: "Late Arrivals",
      value: statsData.late,
      icon: Clock3,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      change: String(statsData.late),
      positive: statsData.late === 0,
    },
    {
      title: "On Leave",
      value: statsData.onLeave,
      icon: Plane,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      change: String(statsData.onLeave),
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-blue-600 text-sm font-semibold uppercase">
            Attendance Management
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Attendance</h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Monitor today's attendance across all branches.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl font-medium w-full sm:w-auto"
        >
          Refresh Live
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((item) => (
          <AttendanceStatsCard key={item.title} {...item} />
        ))}
      </div>

      <AttendanceFilters
        search={search}
        branch={branch}
        method={method}
        status={status}
        date={date}
        branches={branches}
        onSearchChange={setSearch}
        onBranchChange={setBranch}
        onMethodChange={setMethod}
        onStatusChange={setStatus}
        onDateChange={setDate}
        onExport={exportCsv}
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <AttendanceTable
        records={pagedRecords}
        loading={loading}
        onViewHistory={setHistoryRecord}
        page={page}
        pageSize={PAGE_SIZE}
        total={records.length}
        onPageChange={setPage}
      />

      <AttendanceHistoryDrawer
        open={Boolean(historyRecord)}
        employee={historyRecord}
        onClose={() => setHistoryRecord(null)}
      />
    </div>
  );
};

export default AttendancePage;

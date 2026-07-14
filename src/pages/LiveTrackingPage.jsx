import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Car, PauseCircle, WifiOff } from "lucide-react";

import TrackingStatsCard from "../components/tracking/TrackingStatsCard";
import TrackingFilters from "../components/tracking/TrackingFilters";
import LiveMap from "../components/tracking/LiveMap";
import OnlineEmployees from "../components/tracking/OnlineEmployees";
import EmployeeLocationDrawer from "../components/tracking/EmployeeLocationDrawer";
import * as trackingService from "../services/trackingService";
import * as branchService from "../services/branchService";

const POLL_INTERVAL_MS = 30000;

const LiveTrackingPage = () => {
  const [records, setRecords] = useState([]);
  const [statsData, setStatsData] = useState({
    online: 0,
    moving: 0,
    stationary: 0,
    offline: 0,
  });
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [employeeType, setEmployeeType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await branchService.getBranches();
      setBranches(data || []);
    } catch {
      setBranches([]);
    }
  }, []);

  const loadTracking = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const [liveRes, statsRes] = await Promise.all([
        trackingService.getLiveTracking(),
        trackingService.getTrackingStats(),
      ]);

      setRecords(liveRes.data || []);
      setStatsData(
        statsRes.data || { online: 0, moving: 0, stationary: 0, offline: 0 }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load live tracking.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
    loadTracking();
  }, [loadBranches, loadTracking]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadTracking(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [loadTracking]);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const emp = record.employee || {};
      const branchId =
        typeof emp.branch === "object" ? emp.branch?._id : emp.branch;

      const matchesSearch =
        !search.trim() ||
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(search.toLowerCase());

      const matchesBranch = branch === "all" || branchId === branch;
      const matchesStatus = status === "all" || record.status === status;
      const matchesType =
        employeeType === "all" || emp.role === employeeType;

      return matchesSearch && matchesBranch && matchesStatus && matchesType;
    });
  }, [records, search, branch, status, employeeType]);

  const filteredStats = useMemo(() => {
    return {
      online: filtered.filter((r) => r.online).length,
      moving: filtered.filter((r) => r.status === "Moving").length,
      stationary: filtered.filter((r) => r.status === "Stationary").length,
      offline: filtered.filter(
        (r) => r.status === "Offline" || r.status === "GPS Disabled"
      ).length,
    };
  }, [filtered]);

  const displayStats = search || branch !== "all" || status !== "all" || employeeType !== "all"
    ? filteredStats
    : statsData;

  const stats = [
    {
      title: "Online Employees",
      value: displayStats.online,
      icon: Users,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      change: String(displayStats.online),
    },
    {
      title: "Moving",
      value: displayStats.moving,
      icon: Car,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      change: String(displayStats.moving),
    },
    {
      title: "Stationary",
      value: displayStats.stationary,
      icon: PauseCircle,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      change: String(displayStats.stationary),
      positive: false,
    },
    {
      title: "Offline",
      value: displayStats.offline,
      icon: WifiOff,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      change: String(displayStats.offline),
      positive: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-blue-600 font-semibold text-sm uppercase">
          Live Tracking
        </p>

        <h1 className="text-3xl font-bold mt-1">Field Employee Tracking</h1>

        <p className="text-slate-500 mt-1">
          Monitor all field employees in real time.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((item) => (
          <TrackingStatsCard key={item.title} {...item} />
        ))}
      </div>

      <TrackingFilters
        search={search}
        branch={branch}
        status={status}
        employeeType={employeeType}
        branches={branches}
        refreshing={refreshing}
        onSearchChange={setSearch}
        onBranchChange={setBranch}
        onStatusChange={setStatus}
        onEmployeeTypeChange={setEmployeeType}
        onRefresh={() => loadTracking(true)}
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <LiveMap
            records={filtered}
            selectedId={selected?._id}
            onSelect={setSelected}
          />
        </div>

        <div className="col-span-4">
          <OnlineEmployees
            records={filtered}
            loading={loading}
            selectedId={selected?._id}
            onSelect={setSelected}
          />
        </div>
      </div>

      <EmployeeLocationDrawer
        open={Boolean(selected)}
        record={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default LiveTrackingPage;

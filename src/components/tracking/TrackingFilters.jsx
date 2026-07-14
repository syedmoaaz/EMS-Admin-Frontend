import {
  Search,
  RefreshCw,
} from "lucide-react";

const TrackingFilters = ({
  search,
  branch,
  status,
  employeeType,
  branches = [],
  refreshing = false,
  onSearchChange,
  onBranchChange,
  onStatusChange,
  onEmployeeTypeChange,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search field employee..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <select
            value={branch}
            onChange={(e) => onBranchChange?.(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Branches</option>
            {branches.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Moving">Moving</option>
            <option value="Stationary">Stationary</option>
            <option value="Offline">Offline</option>
            <option value="GPS Disabled">GPS Disabled</option>
          </select>
        </div>

        <div className="col-span-2">
          <select
            value={employeeType}
            onChange={(e) => onEmployeeTypeChange?.(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Field Staff</option>
            <option value="Order Taker">Order Taker</option>
            <option value="Dispatcher">Dispatcher</option>
          </select>
        </div>

        <div className="col-span-2 flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 text-white py-3 hover:bg-blue-700 transition disabled:opacity-70"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingFilters;

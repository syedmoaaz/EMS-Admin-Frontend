import {
  BatteryMedium,
  Wifi,
  WifiOff,
  Navigation,
  MapPin,
  ChevronRight,
} from "lucide-react";

const statusColor = (status) => {
  switch (status) {
    case "Moving":
      return "bg-green-100 text-green-700";
    case "Stationary":
      return "bg-blue-100 text-blue-700";
    case "GPS Disabled":
      return "bg-red-100 text-red-700";
    case "Offline":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const formatUpdated = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diffMs = Date.now() - date.getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return date.toLocaleTimeString();
};

const OnlineEmployees = ({
  records = [],
  loading = false,
  selectedId,
  onSelect,
}) => {
  const avatarSrc = (employee) =>
    employee?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || "E")}&background=2563eb&color=fff`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[650px] flex flex-col">
      <div className="px-5 py-5 border-b">
        <h2 className="text-xl font-bold">Live Employees</h2>
        <p className="text-sm text-slate-500 mt-1">
          Real-time field employee tracking.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-16">
            No field employees match your filters.
          </p>
        ) : (
          records.map((record) => {
            const emp = record.employee || {};
            const isSelected =
              selectedId === record._id || selectedId === emp._id;

            return (
              <button
                type="button"
                key={record._id}
                onClick={() => onSelect?.(record)}
                className={`w-full text-left border rounded-2xl p-4 hover:shadow-md transition cursor-pointer ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-100" : ""
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <img
                      src={avatarSrc(emp)}
                      className="w-14 h-14 rounded-full object-cover"
                      alt={emp.name || "Employee"}
                    />

                    <div>
                      <h3 className="font-semibold">{emp.name || "Unknown"}</h3>
                      <p className="text-sm text-slate-500">
                        {emp.designation || emp.role || "—"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {emp.branch?.name || "—"}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-slate-400" />
                </div>

                <div className="mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                  <div className="flex items-center gap-2">
                    <BatteryMedium size={16} className="text-green-600" />
                    {record.battery || "--"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Navigation size={16} className="text-blue-600" />
                    {record.speed || "--"}
                  </div>

                  <div className="flex items-center gap-2">
                    {record.online ? (
                      <>
                        <Wifi size={16} className="text-indigo-600" />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff size={16} className="text-red-500" />
                        Offline
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-red-500" />
                    {formatUpdated(record.lastUpdated)}
                  </div>
                </div>

                <div className="mt-4 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-600">
                  {record.location && record.location !== "--"
                    ? record.location
                    : "Location unavailable"}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OnlineEmployees;

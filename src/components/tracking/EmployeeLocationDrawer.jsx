import {
  X,
  BatteryMedium,
  Wifi,
  WifiOff,
  Navigation,
  MapPin,
  Gauge,
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
  return date.toLocaleString();
};

const EmployeeLocationDrawer = ({ open, onClose, record }) => {
  const emp = record?.employee || {};

  const avatarSrc =
    emp.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || "E")}&background=2563eb&color=fff`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-all duration-300 z-40 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-[480px] bg-white shadow-2xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Employee Location
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Live field tracking details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-90px)]">
          {!record ? (
            <p className="text-slate-500 text-center py-16">
              Select an employee to view location details.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={avatarSrc}
                  alt={emp.name || "Employee"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">{emp.name || "Unknown"}</h3>
                  <p className="text-slate-500 text-sm">
                    {emp.designation || emp.role || "—"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {emp.branch?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="border rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <BatteryMedium size={16} className="text-green-600" />
                    Battery
                  </div>
                  <p className="text-xl font-semibold mt-2">
                    {record.battery || "--"}
                  </p>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Gauge size={16} className="text-blue-600" />
                    Speed
                  </div>
                  <p className="text-xl font-semibold mt-2">
                    {record.speed || "--"}
                  </p>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    {record.online ? (
                      <Wifi size={16} className="text-indigo-600" />
                    ) : (
                      <WifiOff size={16} className="text-red-500" />
                    )}
                    Connection
                  </div>
                  <p className="text-xl font-semibold mt-2">
                    {record.online ? "Online" : "Offline"}
                  </p>
                </div>

                <div className="border rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Navigation size={16} className="text-orange-500" />
                    Status
                  </div>
                  <p className="text-xl font-semibold mt-2">{record.status}</p>
                </div>
              </div>

              <div className="mt-6 border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin size={16} className="text-red-500" />
                  Current location
                </div>
                <p className="font-medium mt-2">
                  {record.location && record.location !== "--"
                    ? record.location
                    : "Location unavailable"}
                </p>
                {typeof record.lat === "number" &&
                  typeof record.lng === "number" && (
                    <p className="text-xs text-slate-400 mt-2">
                      {record.lat.toFixed(5)}, {record.lng.toFixed(5)}
                    </p>
                  )}
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Last updated: {formatUpdated(record.lastUpdated)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeLocationDrawer;

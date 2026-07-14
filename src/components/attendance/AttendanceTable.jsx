import { Eye, Fingerprint, Smartphone, Users } from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-700";
    case "Working":
      return "bg-blue-100 text-blue-700";
    case "Absent":
      return "bg-red-100 text-red-700";
    case "Late":
      return "bg-orange-100 text-orange-700";
    case "On Leave":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const AttendanceTable = ({
  records = [],
  loading = false,
  onViewHistory,
}) => {
  const avatarSrc = (employee) =>
    employee?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name || "E")}&background=2563eb&color=fff`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold">Today's Attendance</h2>
        <p className="text-sm text-slate-500 mt-1">
          Live attendance across all branches.
        </p>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50">
          <tr className="text-left text-sm">
            <th className="px-6 py-4">Employee</th>
            <th>Branch</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Hours</th>
            <th>Method</th>
            <th>Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="py-20">
                <div className="flex justify-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              </td>
            </tr>
          ) : records.length > 0 ? (
            records.map((record) => {
              const employee = record.employee || {};
              const branchName =
                record.branch?.name ||
                employee.branch?.name ||
                "—";

              return (
                <tr
                  key={record._id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarSrc(employee)}
                        alt={employee.name || "Employee"}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">
                          {employee.name || "Unknown"}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {employee.employeeId || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>{branchName}</td>
                  <td>{record.checkIn || "--"}</td>
                  <td>{record.checkOut || "--"}</td>
                  <td>{record.hours || "--"}</td>

                  <td>
                    {record.method === "Biometric" && (
                      <div className="flex items-center gap-2">
                        <Fingerprint size={16} className="text-blue-600" />
                        Biometric
                      </div>
                    )}
                    {record.method === "GPS" && (
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-green-600" />
                        GPS
                      </div>
                    )}
                    {record.method === "Manual" && "Manual"}
                    {(record.method === "--" || !record.method) && "--"}
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => onViewHistory?.(record)}
                      className="w-9 h-9 rounded-xl border hover:bg-slate-100 inline-flex items-center justify-center"
                      title="View history"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="py-20">
                <div className="flex flex-col items-center text-slate-500">
                  <Users size={36} className="text-blue-600 mb-3" />
                  <p className="font-medium text-slate-800">No attendance records</p>
                  <p className="text-sm mt-1">
                    Try another date or adjust your filters.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;

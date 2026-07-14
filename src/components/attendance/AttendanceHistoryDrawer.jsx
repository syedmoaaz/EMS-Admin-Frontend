import { useEffect, useState } from "react";
import { X, Fingerprint, Smartphone } from "lucide-react";
import * as attendanceService from "../../services/attendanceService";

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

const AttendanceHistoryDrawer = ({ open, onClose, employee }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const employeeId =
    typeof employee?.employee === "object"
      ? employee.employee?._id
      : employee?.employee;

  const employeeInfo =
    typeof employee?.employee === "object" ? employee.employee : null;

  useEffect(() => {
    if (!open || !employeeId) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await attendanceService.getAttendanceHistory(employeeId);
        setRecords(data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load history.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, employeeId]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-all duration-300 z-40 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-[520px] bg-white shadow-2xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Attendance History
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {employeeInfo?.name || "Employee"}{" "}
              {employeeInfo?.employeeId ? `· ${employeeInfo.employeeId}` : ""}
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
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : records.length === 0 ? (
            <p className="text-slate-500 text-center py-16">
              No attendance history found.
            </p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="border border-slate-200 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{record.date}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-slate-600">
                    <div>
                      <p className="text-xs text-slate-400">Check In</p>
                      <p className="font-medium">{record.checkIn || "--"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Check Out</p>
                      <p className="font-medium">{record.checkOut || "--"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Hours</p>
                      <p className="font-medium">{record.hours || "--"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Method</p>
                      <div className="flex items-center gap-1.5 font-medium">
                        {record.method === "Biometric" && (
                          <Fingerprint size={14} className="text-blue-600" />
                        )}
                        {record.method === "GPS" && (
                          <Smartphone size={14} className="text-green-600" />
                        )}
                        {record.method || "--"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceHistoryDrawer;

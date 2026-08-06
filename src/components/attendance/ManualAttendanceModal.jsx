import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import * as employeeService from "../../services/employeeService";
import * as attendanceService from "../../services/attendanceService";
import { notifyError, notifySuccess } from "../../utils/notify";

const todayLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const nowTimeValue = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Manual attendance — check-in time only (no check-out).
 */
const ManualAttendanceModal = ({
  open,
  onClose,
  defaultDate,
  onSaved,
}) => {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(defaultDate || todayLocal());
  const [time, setTime] = useState(nowTimeValue());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingEmps, setLoadingEmps] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate || todayLocal());
    setTime(nowTimeValue());
    setNote("");
    setError("");
    setEmployeeId("");

    let cancelled = false;
    (async () => {
      setLoadingEmps(true);
      try {
        const { data } = await employeeService.getEmployees({ status: "Active" });
        if (!cancelled) setEmployees(data || []);
      } catch {
        if (!cancelled) setEmployees([]);
      } finally {
        if (!cancelled) setLoadingEmps(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, defaultDate]);

  const selected = useMemo(
    () => employees.find((e) => e._id === employeeId),
    [employees, employeeId]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError("");

    if (!employeeId || !date || !time) {
      setError("Employee, date and check-in time are required.");
      return;
    }

    setSaving(true);
    try {
      await attendanceService.createAttendance({
        employee: employeeId,
        date,
        checkIn: time,
        note,
        branch:
          typeof selected?.branch === "object"
            ? selected.branch?._id
            : selected?.branch,
      });
      notifySuccess("Manual attendance saved.");
      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to save.";
      setError(msg);
      notifyError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Manual attendance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check-in time only — for power / device / internet outages.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Employee *
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5"
                disabled={loadingEmps}
              >
                <option value="">
                  {loadingEmps ? "Loading…" : "Select employee"}
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Check-in time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5"
              />
              <p className="text-xs text-slate-500 mt-1">
                No check-out — first mark of the day counts as attendance.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Note (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5"
                placeholder="e.g. Power outage / device offline"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border rounded-xl py-2.5 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save attendance"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ManualAttendanceModal;

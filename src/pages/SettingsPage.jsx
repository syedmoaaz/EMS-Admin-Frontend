import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  Clock3,
  ShieldAlert,
  KeyRound,
  Save,
  MapPinned,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as settingsService from "../services/settingsService";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    companyName: "",
    ownerName: "",
    phone: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState({
    officeTimings: { start: "09:00 AM", end: "06:00 PM" },
    workingDays: WEEK_DAYS.slice(0, 6),
    attendanceRules: {
      lateThresholdMinutes: 15,
      halfDayHours: 4,
      fullDayHours: 8,
    },
    gpsRules: {
      refreshIntervalSeconds: 30,
      offlineTimeoutMinutes: 15,
    },
    alertSettings: {
      absentAlert: true,
      lateAlert: true,
      gpsDisabledAlert: true,
      offlineAlert: true,
      lowBatteryAlert: true,
      lowBatteryThreshold: 35,
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileRes, settingsRes] = await Promise.all([
          settingsService.getCompanyProfile(),
          settingsService.getSettings(),
        ]);

        const u = profileRes.user || {};
        setProfile({
          companyName: u.companyName || "",
          ownerName: u.ownerName || u.name || "",
          phone: u.phone || "",
          email: u.email || "",
        });

        if (settingsRes.data) {
          setSettings((prev) => ({
            ...prev,
            ...settingsRes.data,
            officeTimings: {
              ...prev.officeTimings,
              ...settingsRes.data.officeTimings,
            },
            attendanceRules: {
              ...prev.attendanceRules,
              ...settingsRes.data.attendanceRules,
            },
            gpsRules: {
              ...prev.gpsRules,
              ...settingsRes.data.gpsRules,
            },
            alertSettings: {
              ...prev.alertSettings,
              ...settingsRes.data.alertSettings,
            },
            workingDays: settingsRes.data.workingDays || prev.workingDays,
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleDay = (day) => {
    setSettings((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const saveProfileAndRules = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsService.updateCompanyProfile({
          companyName: profile.companyName,
          ownerName: profile.ownerName,
          phone: profile.phone,
        }),
        settingsService.updateSettings({
          officeTimings: settings.officeTimings,
          workingDays: settings.workingDays,
          attendanceRules: settings.attendanceRules,
          gpsRules: settings.gpsRules,
          alertSettings: settings.alertSettings,
        }),
      ]);

      if (user) {
        updateUser({
          ...user,
          companyName: profile.companyName,
          name: profile.ownerName,
          ownerName: profile.ownerName,
          phone: profile.phone,
        });
      }

      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Enter current and new password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await settingsService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-blue-600 text-sm font-semibold uppercase">
            System Settings
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Settings</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Configure company profile, timings, GPS and alert rules.
          </p>
        </div>

        <button
          type="button"
          onClick={saveProfileAndRules}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 w-full sm:w-auto"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Company profile */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Company Profile</h2>
            <p className="text-sm text-slate-500">Owner account details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              value={profile.companyName}
              onChange={(e) =>
                setProfile((p) => ({ ...p, companyName: e.target.value }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Owner Name</label>
            <input
              value={profile.ownerName}
              onChange={(e) =>
                setProfile((p) => ({ ...p, ownerName: e.target.value }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email (login)</label>
            <input
              value={profile.email}
              disabled
              className="w-full border rounded-xl px-4 py-3 bg-slate-50 text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* Timings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock3 size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Office Timings & Attendance</h2>
            <p className="text-sm text-slate-500">Working hours and late rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              value={settings.officeTimings.start}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  officeTimings: { ...s.officeTimings, start: e.target.value },
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
              placeholder="09:00 AM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              value={settings.officeTimings.end}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  officeTimings: { ...s.officeTimings, end: e.target.value },
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
              placeholder="06:00 PM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Late Threshold (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={settings.attendanceRules.lateThresholdMinutes}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  attendanceRules: {
                    ...s.attendanceRules,
                    lateThresholdMinutes: Number(e.target.value),
                  },
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Day Hours
            </label>
            <input
              type="number"
              min={1}
              value={settings.attendanceRules.fullDayHours}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  attendanceRules: {
                    ...s.attendanceRules,
                    fullDayHours: Number(e.target.value),
                  },
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-3">Working Days</p>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const active = settings.workingDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GPS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
            <MapPinned size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">GPS Rules</h2>
            <p className="text-sm text-slate-500">Live tracking refresh settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              min={5}
              value={settings.gpsRules.refreshIntervalSeconds}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  gpsRules: {
                    ...s.gpsRules,
                    refreshIntervalSeconds: Number(e.target.value),
                  },
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Offline Timeout (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={settings.gpsRules.offlineTimeoutMinutes}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  gpsRules: {
                    ...s.gpsRules,
                    offlineTimeoutMinutes: Number(e.target.value),
                  },
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <ShieldAlert size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Alert Settings</h2>
            <p className="text-sm text-slate-500">
              Choose which events create alerts
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ["absentAlert", "Absent alerts"],
            ["lateAlert", "Late arrival alerts"],
            ["gpsDisabledAlert", "GPS disabled alerts"],
            ["offlineAlert", "Offline alerts"],
            ["lowBatteryAlert", "Low battery alerts"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between border rounded-xl px-4 py-3"
            >
              <span className="font-medium text-sm">{label}</span>
              <input
                type="checkbox"
                checked={Boolean(settings.alertSettings[key])}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    alertSettings: {
                      ...s.alertSettings,
                      [key]: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 max-w-xs">
          <label className="block text-sm font-medium mb-2">
            Low Battery Threshold (%)
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={settings.alertSettings.lowBatteryThreshold}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                alertSettings: {
                  ...s.alertSettings,
                  lowBatteryThreshold: Number(e.target.value),
                },
              }))
            }
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
            <KeyRound size={20} className="text-slate-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Change Password</h2>
            <p className="text-sm text-slate-500">Update owner login password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  newPassword: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={savePassword}
          className="mt-5 px-5 py-3 rounded-xl border hover:bg-slate-50 font-medium"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

import { useCallback, useEffect, useState } from "react";
import { KeyRound, RefreshCw, Fingerprint } from "lucide-react";
import toast from "react-hot-toast";
import * as branchService from "../../services/branchService";

const MIN_SECRET_LEN = 14;

const statusStyles = {
  online: "bg-green-100 text-green-700",
  offline: "bg-slate-100 text-slate-600",
  error: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

const BranchDevicePanel = ({ branchId, open }) => {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const { data } = await branchService.getBranchDevice(branchId);
      setDevice(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load device status");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (open && branchId) {
      setSecret("");
      setConfirmSecret("");
      load();
    }
  }, [open, branchId, load]);

  const saveSecret = async () => {
    const value = secret.trim();
    if (value.length < MIN_SECRET_LEN) {
      toast.error(`Secret must be at least ${MIN_SECRET_LEN} characters.`);
      return;
    }
    if (/\s/.test(value)) {
      toast.error("Secret must not contain spaces.");
      return;
    }
    if (value !== confirmSecret.trim()) {
      toast.error("Secret and confirm secret do not match.");
      return;
    }

    const confirmed = window.confirm(
      device?.hasSecret
        ? "Update this branch device secret? Update the Windows agent with the same secret or uploads will fail."
        : "Save this device secret for this branch only? Use the exact same secret in the branch agent."
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const { data, message } = await branchService.setBranchDeviceSecret(
        branchId,
        value
      );
      setDevice(data);
      setSecret("");
      setConfirmSecret("");
      toast.success(message || "Device secret saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save secret");
    } finally {
      setBusy(false);
    }
  };

  if (!branchId) return null;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Fingerprint size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Biometric device agent</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose a device secret for this branch, then paste the{" "}
            <strong>same</strong> secret into the Windows agent. Do not reuse it
            on another branch. Enroll staff on the K50 using their numeric Device
            PIN (not Employee ID like THT-1).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                statusStyles[device?.status] || statusStyles.pending
              }`}
            >
              {device?.hasSecret ? device.status : "not configured"}
            </span>
            {device?.hasSecret ? (
              <span className="text-xs text-slate-500">Secret is set</span>
            ) : (
              <span className="text-xs text-amber-700">Secret not set yet</span>
            )}
            {device?.lastSyncAt && (
              <span className="text-slate-500 text-xs">
                Last sync: {new Date(device.lastSyncAt).toLocaleString()}
              </span>
            )}
            {device?.lastHeartbeatAt && (
              <span className="text-slate-500 text-xs">
                Heartbeat: {new Date(device.lastHeartbeatAt).toLocaleString()}
              </span>
            )}
          </div>

          {device?.lastError ? (
            <p className="text-xs text-red-600 mb-3">{device.lastError}</p>
          ) : null}

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 mb-4">
            <p className="text-xs text-amber-900 font-medium">
              Precautions
            </p>
            <ul className="mt-1 text-xs text-amber-800 list-disc pl-4 space-y-0.5">
              <li>Secret must be at least {MIN_SECRET_LEN} characters</li>
              <li>No spaces</li>
              <li>One secret per branch — never share across branches</li>
              <li>Use the exact same value in the Electron agent</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                {device?.hasSecret ? "New device secret" : "Device secret"}
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                autoComplete="new-password"
                placeholder={`Min. ${MIN_SECRET_LEN} characters`}
                className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Confirm secret
              </label>
              <input
                type="password"
                value={confirmSecret}
                onChange={(e) => setConfirmSecret(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat secret"
                className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={saveSecret}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-70"
            >
              <KeyRound size={16} />
              {device?.hasSecret ? "Update secret" : "Save secret"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white text-sm hover:bg-slate-50 disabled:opacity-70"
            >
              <RefreshCw size={16} />
              Refresh status
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchDevicePanel;

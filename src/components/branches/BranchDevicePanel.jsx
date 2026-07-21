import { useCallback, useEffect, useState } from "react";
import { KeyRound, Copy, RefreshCw, Ban, Fingerprint } from "lucide-react";
import toast from "react-hot-toast";
import * as branchService from "../../services/branchService";

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
  const [plainSecret, setPlainSecret] = useState("");

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
      setPlainSecret("");
      load();
    }
  }, [open, branchId, load]);

  const generateSecret = async () => {
    const confirmed = window.confirm(
      plainSecret || device?.hasSecret
        ? "Rotate device secret? The current agent will stop working until you paste the new secret."
        : "Generate a device secret for this branch only? Do not reuse it on another branch."
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const { data, message } = await branchService.generateBranchDeviceSecret(
        branchId
      );
      setDevice(data);
      setPlainSecret(data.deviceSecret || "");
      toast.success(message || "Device secret generated — copy it now");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate secret");
    } finally {
      setBusy(false);
    }
  };

  const revokeSecret = async () => {
    const confirmed = window.confirm(
      "Revoke this branch device secret? The agent will stop syncing until you generate a new one."
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await branchService.revokeBranchDeviceSecret(branchId);
      setPlainSecret("");
      await load();
      toast.success("Device secret revoked");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke secret");
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!plainSecret) return;
    try {
      await navigator.clipboard.writeText(plainSecret);
      toast.success("Secret copied");
    } catch {
      toast.error("Could not copy — select and copy manually");
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
            Each branch needs its own device secret so attendance never mixes with
            other branches. Paste the secret only into this branch&apos;s Windows
            agent. Enroll staff on the K50 using their numeric Device PIN (not
            Employee ID like THT-1).
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

          {plainSecret ? (
            <div className="mb-4 rounded-xl bg-white border border-amber-200 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-2">
                Copy now — this secret will not be shown again
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={plainSecret}
                  className="flex-1 text-xs font-mono border rounded-lg px-3 py-2 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={copySecret}
                  className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 inline-flex items-center gap-1 text-sm"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={generateSecret}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-70"
            >
              <KeyRound size={16} />
              {device?.hasSecret ? "Rotate secret" : "Generate secret"}
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

            {device?.hasSecret ? (
              <button
                type="button"
                disabled={busy}
                onClick={revokeSecret}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-red-600 text-sm hover:bg-red-50 disabled:opacity-70"
              >
                <Ban size={16} />
                Revoke
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default BranchDevicePanel;

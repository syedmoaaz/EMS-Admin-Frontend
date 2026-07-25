import { useCallback, useEffect, useState } from "react";
import { KeyRound, Fingerprint, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import * as branchService from "../../services/branchService";

const MIN_SECRET_LEN = 14;

const BranchDevicePanel = ({ branchId, open }) => {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const { data } = await branchService.getBranchDevice(branchId);
      setDevice(data);
      const existing = data?.deviceSecret || "";
      setSecret(existing);
      setConfirmSecret(existing);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load device secret");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (open && branchId) {
      setShowSecret(false);
      setShowConfirm(false);
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

    setBusy(true);
    try {
      const { data, message } = await branchService.setBranchDeviceSecret(
        branchId,
        value
      );
      setDevice(data);
      setSecret(data?.deviceSecret || value);
      setConfirmSecret(data?.deviceSecret || value);
      toast.success(message || "Agent secret created successfully");
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
            Set a device secret for this branch, then paste the same value into
            the Windows agent. Do not reuse it on another branch.
          </p>
          {device?.hasSecret ? (
            <p className="text-xs text-green-700 mt-1 font-medium">
              Secret is saved — use the eye icon to view it.
            </p>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 mb-4">
            <p className="text-xs text-amber-900 font-medium">Precautions</p>
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
                Device secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  autoComplete="off"
                  placeholder={`Min. ${MIN_SECRET_LEN} characters`}
                  className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Confirm secret
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmSecret}
                  onChange={(e) => setConfirmSecret(e.target.value)}
                  autoComplete="off"
                  placeholder="Repeat secret"
                  className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800"
                  aria-label={showConfirm ? "Hide confirm" : "Show confirm"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={saveSecret}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-70"
          >
            <KeyRound size={16} />
            {device?.hasSecret ? "Update secret" : "Save secret"}
          </button>
        </>
      )}
    </div>
  );
};

export default BranchDevicePanel;

import { useEffect, useState } from "react";
import { X, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import * as branchService from "../../services/branchService";
import BranchDevicePanel from "./BranchDevicePanel";

const emptyForm = {
  name: "",
  code: "",
  phone: "",
  city: "",
  manager: "",
  address: "",
  openingDate: "",
  status: "Active",
};

const AddBranchDrawer = ({ open, onClose, branch = null, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(branch?._id);

  useEffect(() => {
    if (!open) return;

    setError("");

    if (branch) {
      setForm({
        name: branch.name || "",
        code: branch.code || "",
        phone: branch.phone || "",
        city: branch.city || "",
        manager: branch.manager || "",
        address: branch.address || "",
        openingDate: branch.openingDate
          ? new Date(branch.openingDate).toISOString().slice(0, 10)
          : "",
        status: branch.status || "Active",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, branch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.code.trim() || !form.city.trim() || !form.address.trim()) {
      setError("Name, code, city and address are required.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      manager: form.manager.trim(),
      address: form.address.trim(),
      status: form.status,
      openingDate: form.openingDate || undefined,
    };

    try {
      if (isEdit) {
        await branchService.updateBranch(branch._id, payload);
        toast.success("Branch updated");
      } else {
        await branchService.createBranch(payload);
        toast.success("Branch created");
      }

      onSaved?.();
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to save branch. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-all duration-300 z-40 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-[520px] bg-white shadow-2xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isEdit ? "Edit Branch" : "Add Branch"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit
                ? "Update branch details."
                : "Create a new company branch."}
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

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto h-[calc(100vh-90px)]"
        >
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
              <Building2 size={42} className="text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mt-8">
            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium">
                Branch Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Karachi Branch"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Branch Code *
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="KHI-01"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="03XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="Karachi"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Branch Manager
              </label>
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="Ahmed Raza"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium">
                Branch Address *
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-xl px-4 py-3 resize-none"
                placeholder="Complete branch address..."
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Opening Date
              </label>
              <input
                type="date"
                name="openingDate"
                value={form.openingDate}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <BranchDevicePanel branchId={branch._id} open={open} />
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Branch"
                  : "Save Branch"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddBranchDrawer;

import { useEffect, useRef, useState } from "react";
import { X, Camera, Upload } from "lucide-react";
import toast from "react-hot-toast";
import * as employeeService from "../../services/employeeService";

const emptyForm = {
  name: "",
  employeeId: "",
  phone: "",
  branch: "",
  designation: "",
  department: "",
  role: "Office Staff",
  joiningDate: "",
  status: "Active",
  image: "",
  shiftTiming: "",
};

const AddEmployeeDrawer = ({
  open,
  onClose,
  employee = null,
  branches = [],
  onSaved,
}) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(employee?._id);

  useEffect(() => {
    if (!open) return;

    setError("");

    if (employee) {
      const branchId =
        typeof employee.branch === "object"
          ? employee.branch?._id
          : employee.branch;

      setForm({
        name: employee.name || "",
        employeeId: employee.employeeId || "",
        phone: employee.phone || "",
        branch: branchId || "",
        designation: employee.designation || "",
        department: employee.department || "",
        role: employee.role || "Office Staff",
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().slice(0, 10)
          : "",
        status: employee.status || "Active",
        image: employee.image || "",
        shiftTiming: employee.shiftTiming || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.employeeId.trim() ||
      !form.phone.trim() ||
      !form.branch ||
      !form.designation
    ) {
      setError("Name, employee ID, phone, branch and designation are required.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      employeeId: form.employeeId.trim().toUpperCase(),
      phone: form.phone.trim(),
      branch: form.branch,
      designation: form.designation,
      department: form.department.trim(),
      role: form.role,
      status: form.status,
      image: form.image || "",
      shiftTiming: form.shiftTiming.trim(),
      joiningDate: form.joiningDate || undefined,
    };

    try {
      if (isEdit) {
        await employeeService.updateEmployee(employee._id, payload);
        toast.success("Employee updated");
      } else {
        await employeeService.createEmployee(payload);
        toast.success("Employee created");
      }

      onSaved?.();
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to save employee. Please try again.";
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
              {isEdit ? "Edit Employee" : "Add Employee"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit
                ? "Update employee profile."
                : "Create a new employee profile."}
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
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 overflow-hidden bg-slate-100">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Employee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={40} className="text-slate-400" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImage}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition px-5 py-2 rounded-xl text-sm font-medium"
            >
              <Upload size={16} />
              Upload Photo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5 mt-8">
            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium">
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmed Raza"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Employee ID *
              </label>
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="EMP-0001"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Phone Number *
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
              <label className="block mb-2 text-sm font-medium">Branch *</label>
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Designation *
              </label>
              <select
                name="designation"
                value={form.designation}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="">Select Designation</option>
                {employeeService.DESIGNATIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Department
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="Sales"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Employee Type
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                {employeeService.EMPLOYEE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Shift Timing
              </label>
              <input
                name="shiftTiming"
                value={form.shiftTiming}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="09:00 AM - 06:00 PM"
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
                  ? "Update Employee"
                  : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddEmployeeDrawer;

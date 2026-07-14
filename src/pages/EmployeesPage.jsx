import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Users, Eye, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AddEmployeeDrawer from "../components/employees/AddEmployeeDrawer";
import * as employeeService from "../services/employeeService";
import * as branchService from "../services/branchService";

const EmployeesPage = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const designations = useMemo(() => {
    const fromData = [
      ...new Set(employees.map((e) => e.designation).filter(Boolean)),
    ];
    return [...new Set([...employeeService.DESIGNATIONS, ...fromData])].sort();
  }, [employees]);

  const loadBranches = useCallback(async () => {
    try {
      const { data } = await branchService.getBranches();
      setBranches(data || []);
    } catch {
      setBranches([]);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (branchFilter !== "all") params.branch = branchFilter;
      if (designationFilter !== "all") params.designation = designationFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const { data } = await employeeService.getEmployees(params);
      setEmployees(data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load employees.";
      setError(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [search, branchFilter, designationFilter, statusFilter]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadEmployees]);

  const openCreate = () => {
    setEditingEmployee(null);
    setOpenDrawer(true);
  };

  const openEdit = (employee) => {
    setEditingEmployee(employee);
    setOpenDrawer(true);
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Delete employee "${employee.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await employeeService.deleteEmployee(employee._id);
      toast.success("Employee deleted");
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete employee.");
    }
  };

  const getBranchName = (employee) => {
    if (employee.branch && typeof employee.branch === "object") {
      return employee.branch.name || "—";
    }
    const match = branches.find((b) => b._id === employee.branch);
    return match?.name || "—";
  };

  const avatarSrc = (employee) =>
    employee.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || "E")}&background=2563eb&color=fff`;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase">
              Employee Management
            </p>

            <h1 className="text-3xl font-bold mt-1">Employees</h1>

            <p className="text-slate-500 mt-1">
              Manage employees across all company branches.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl font-medium shadow"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="all">All Designations</option>
              {designations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Employee</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Employee ID
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  Designation
                </th>
                <th className="px-6 py-4 text-left font-semibold">Phone</th>
                <th className="px-6 py-4 text-left font-semibold">Branch</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20">
                    <div className="flex justify-center">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarSrc(employee)}
                          alt={employee.name}
                          className="w-11 h-11 rounded-full object-cover"
                        />

                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-xs text-slate-500">
                            {employee.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {employee.employeeId}
                    </td>

                    <td className="px-6 py-4">{employee.designation}</td>

                    <td className="px-6 py-4 text-slate-600">
                      {employee.phone}
                    </td>

                    <td className="px-6 py-4">{getBranchName(employee)}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(employee)}
                          className="w-9 h-9 rounded-xl border hover:bg-slate-100 inline-flex items-center justify-center"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(employee)}
                          className="w-9 h-9 rounded-xl border hover:bg-slate-100 inline-flex items-center justify-center"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(employee)}
                          className="w-9 h-9 rounded-xl border hover:bg-red-50 text-red-600 inline-flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                        <Users size={36} className="text-blue-600" />
                      </div>

                      <h2 className="text-xl font-semibold mt-5">
                        No Employees Found
                      </h2>

                      <p className="text-slate-500 mt-2">
                        Try adjusting your filters or add a new employee.
                      </p>

                      <button
                        type="button"
                        onClick={openCreate}
                        className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl"
                      >
                        <Plus size={18} />
                        Add Employee
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEmployeeDrawer
        open={openDrawer}
        employee={editingEmployee}
        branches={branches}
        onClose={() => {
          setOpenDrawer(false);
          setEditingEmployee(null);
        }}
        onSaved={loadEmployees}
      />
    </>
  );
};

export default EmployeesPage;

import { useMemo, useState } from "react";
import { Search, Plus, Users, Eye, Pencil, Trash2 } from "lucide-react";
import AddEmployeeDrawer from "../components/employees/AddEmployeeDrawer";
import {
  employees,
  branches,
  getBranchName,
  getDesignations,
} from "../data";

const EmployeesPage = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const designations = getDesignations();

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        search === "" ||
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        employee.phone.includes(search);

      const matchesBranch =
        branchFilter === "all" ||
        employee.branchId === Number(branchFilter);

      const matchesDesignation =
        designationFilter === "all" ||
        employee.designation === designationFilter;

      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;

      return (
        matchesSearch && matchesBranch && matchesDesignation && matchesStatus
      );
    });
  }, [search, branchFilter, designationFilter, statusFilter]);

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
            onClick={() => setOpenDrawer(true)}
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
                <option key={branch.id} value={branch.id}>
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
                <th className="px-6 py-4 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={employee.image}
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

                    <td className="px-6 py-4">
                      {getBranchName(employee.branchId)}
                    </td>

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
                        <button className="w-9 h-9 rounded-xl border hover:bg-slate-100 inline-flex items-center justify-center">
                          <Eye size={16} />
                        </button>

                        <button className="w-9 h-9 rounded-xl border hover:bg-slate-100 inline-flex items-center justify-center">
                          <Pencil size={16} />
                        </button>

                        <button className="w-9 h-9 rounded-xl border hover:bg-red-50 text-red-600 inline-flex items-center justify-center">
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
                        onClick={() => setOpenDrawer(true)}
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
        onClose={() => setOpenDrawer(false)}
      />
    </>
  );
};

export default EmployeesPage;

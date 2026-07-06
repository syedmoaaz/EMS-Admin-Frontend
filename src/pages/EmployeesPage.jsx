import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import AddEmployeeDrawer from "../components/employees/AddEmployeeDrawer";

const EmployeesPage = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <>
      <div className="space-y-6">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase">
              Employee Management
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Employees
            </h1>

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

        {/* Filters */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

          <div className="grid grid-cols-4 gap-4">

            {/* Search */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                placeholder="Search employee..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Branch */}

            <select className="rounded-xl border border-slate-200 px-4 py-3">

              <option>All Branches</option>

              <option>Head Office</option>

              <option>Karachi</option>

              <option>Lahore</option>

              <option>Islamabad</option>

            </select>

            {/* Designation */}

            <select className="rounded-xl border border-slate-200 px-4 py-3">

              <option>All Designations</option>

              <option>Manager</option>

              <option>Medical Representative</option>

              <option>Dispatcher</option>

            </select>

            {/* Status */}

            <select className="rounded-xl border border-slate-200 px-4 py-3">

              <option>All Status</option>

              <option>Active</option>

              <option>Inactive</option>

            </select>

          </div>

        </div>

        {/* Table */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-50 border-b">

              <tr>

                <th className="px-6 py-4 text-left font-semibold">
                  Employee
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Employee ID
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Designation
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Phone
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Branch
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-center font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td
                  colSpan={7}
                  className="py-20"
                >

                  <div className="flex flex-col items-center">

                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">

                      <Users
                        size={36}
                        className="text-blue-600"
                      />

                    </div>

                    <h2 className="text-xl font-semibold mt-5">
                      No Employees Found
                    </h2>

                    <p className="text-slate-500 mt-2">
                      Add your first employee to get started.
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

            </tbody>

          </table>

        </div>

      </div>

      {/* Drawer */}

      <AddEmployeeDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </>
  );
};

export default EmployeesPage;
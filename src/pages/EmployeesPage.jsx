import { Search, Plus, Filter } from "lucide-react";

const EmployeesPage = () => {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <p className="text-blue-600 font-semibold text-sm uppercase">
            Employee Management
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Employees
          </h1>

          <p className="text-slate-500 mt-1">
            Manage employees across all company branches.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl font-medium shadow">
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

          <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none">

            <option>All Branches</option>

            <option>Head Office</option>

            <option>Karachi</option>

            <option>Lahore</option>

            <option>Islamabad</option>

          </select>

          {/* Designation */}

          <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none">

            <option>All Designations</option>

            <option>Manager</option>

            <option>Medical Representative</option>

            <option>Dispatcher</option>

            <option>Accountant</option>

          </select>

          {/* Status */}

          <select className="rounded-xl border border-slate-200 px-4 py-3 outline-none">

            <option>All Status</option>

            <option>Active</option>

            <option>Inactive</option>

          </select>

        </div>

      </div>

      {/* Employee Table */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-50 border-b">

            <tr className="text-left">

              <th className="px-6 py-4 font-semibold">Employee ID</th>

              <th className="px-6 py-4 font-semibold">Employee</th>

              <th className="px-6 py-4 font-semibold">Designation</th>

              <th className="px-6 py-4 font-semibold">Phone</th>

              <th className="px-6 py-4 font-semibold">Branch</th>

              <th className="px-6 py-4 font-semibold">Status</th>

              <th className="px-6 py-4 font-semibold text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan={7}
                className="py-24 text-center"
              >

                <div className="flex flex-col items-center">

                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">

                    <Filter
                      className="text-slate-400"
                      size={28}
                    />

                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    No Employees Found
                  </h2>

                  <p className="text-slate-500 mt-2">
                    Start by adding your first employee.
                  </p>

                  <button className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl font-medium">

                    + Add Employee

                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default EmployeesPage;
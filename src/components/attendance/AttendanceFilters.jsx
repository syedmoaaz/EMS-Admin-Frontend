import {
  Search,
  CalendarDays,
  Download,
} from "lucide-react";
import { branches } from "../../data";

const AttendanceFilters = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <div className="grid grid-cols-12 gap-4 items-center">

        {/* Search */}

        <div className="col-span-4 relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search employee..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Branch */}

        <div className="col-span-2">

          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">

            <option>All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id}>{branch.name}</option>
            ))}

          </select>

        </div>

        {/* Method */}

        <div className="col-span-2">

          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">

            <option>All Methods</option>
            <option>Biometric</option>
            <option>GPS</option>
            <option>Manual</option>

          </select>

        </div>

        {/* Status */}

        <div className="col-span-2">

          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">

            <option>All Status</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
            <option>On Leave</option>

          </select>

        </div>

        {/* Date */}

        <div className="col-span-2 flex gap-2">

          <button className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 py-3 hover:bg-slate-50">

            <CalendarDays size={18} />

            Today

          </button>

          <button className="w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">

            <Download size={18} />

          </button>

        </div>

      </div>

    </div>
  );
};

export default AttendanceFilters;
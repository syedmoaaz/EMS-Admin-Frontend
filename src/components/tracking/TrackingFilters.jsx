import {
  Search,
  RefreshCw,
} from "lucide-react";
import { branches } from "../../data";

const TrackingFilters = () => {
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
            placeholder="Search field employee..."
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

        {/* Status */}

        <div className="col-span-2">

          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">

            <option>All Status</option>
            <option>Moving</option>
            <option>Stationary</option>
            <option>Offline</option>
            <option>GPS Disabled</option>

          </select>

        </div>

        {/* Employee Type */}

        <div className="col-span-2">

          <select className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">

            <option>All Field Staff</option>
            <option>Order Taker</option>
            <option>Dispatcher</option>

          </select>

        </div>

        {/* Refresh */}

        <div className="col-span-2 flex gap-2">

          <button className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 text-white py-3 hover:bg-blue-700 transition">

            <RefreshCw size={18} />

            Refresh

          </button>

        </div>

      </div>

    </div>
  );
};

export default TrackingFilters;
import {
  Bell,
  Search,
  CalendarDays,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TopNavbar = () => {
  const { user } = useAuth();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "AD";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">

      {/* Left Side */}

      <div className="flex items-center gap-4">

        {/* Company */}

        <button className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 hover:bg-slate-200 transition">

          <Building2 size={18} className="text-blue-600" />

          <span className="font-medium">
            {user?.companyName ?? "NovaPharma Ltd."}
          </span>

        </button>

        {/* Search */}

        <div className="relative w-105">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search employees, branches, IDs..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-4">

        {/* Date */}

        <div className="flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-slate-600">

          <CalendarDays size={18} />

          {today}

        </div>

        {/* Notification */}

        <button className="relative w-11 h-11 border rounded-xl flex items-center justify-center">

          <Bell size={20} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            5
          </span>

        </button>

        {/* Profile */}

        <div className="flex items-center gap-3 border rounded-xl px-3 py-2">

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            {initials}
          </div>

          <div>
            <h4 className="font-semibold text-sm">{user?.name ?? "Admin"}</h4>
            <p className="text-xs text-slate-500">{user?.companyName ?? "Company Owner"}</p>
          </div>

        </div>

      </div>

    </header>
  );
};

export default TopNavbar;
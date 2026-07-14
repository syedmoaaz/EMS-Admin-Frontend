import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  CalendarDays,
  Building2,
  Menu,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import * as alertService from "../services/alertService";

const TopNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "AD";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const todayFull = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const loadUnread = useCallback(async () => {
    try {
      const { data } = await alertService.getUnreadCount({ sync: "true" });
      setUnreadCount(data?.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnread();
    const timer = setInterval(loadUnread, 60000);
    return () => clearInterval(timer);
  }, [loadUnread]);

  return (
    <header className="min-h-16 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-8 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={openSidebar}
          className="lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-slate-50 shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="hidden sm:flex items-center gap-2 lg:gap-3 bg-slate-100 rounded-xl px-3 lg:px-4 py-2 hover:bg-slate-200 transition shrink-0 max-w-[180px] lg:max-w-none"
        >
          <Building2 size={18} className="text-blue-600 shrink-0" />
          <span className="font-medium truncate text-sm lg:text-base">
            {user?.companyName ?? "NovaPharma Ltd."}
          </span>
        </button>

        <div className="relative flex-1 max-w-xl hidden md:block">
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

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 border rounded-xl px-4 py-2 text-sm text-slate-600">
          <CalendarDays size={18} />
          {todayFull}
        </div>

        <div className="hidden sm:flex lg:hidden items-center gap-2 border rounded-xl px-3 py-2 text-xs text-slate-600">
          <CalendarDays size={16} />
          {today}
        </div>

        <button
          type="button"
          onClick={() => navigate("/alerts")}
          className="relative w-10 h-10 sm:w-11 sm:h-11 border rounded-xl flex items-center justify-center hover:bg-slate-50"
          title="Alerts"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <Link
          to="/settings"
          className="flex items-center gap-2 sm:gap-3 border rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-slate-50"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>

          <div className="hidden md:block">
            <h4 className="font-semibold text-sm">{user?.name ?? "Admin"}</h4>
            <p className="text-xs text-slate-500 truncate max-w-[140px]">
              {user?.companyName ?? "Company Owner"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopNavbar;

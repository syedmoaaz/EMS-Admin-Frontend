import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  MapPinned,
  Bell,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Branches", path: "/branches", icon: Building2 },
  { name: "Attendance", path: "/attendance", icon: CalendarCheck },
  { name: "Live Tracking", path: "/live-tracking", icon: MapPinned },
  { name: "Alerts & Notifications", path: "/alerts", icon: Bell },
  { name: "Reports", path: "/reports", icon: FileBarChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-[#08143b] text-white flex flex-col shadow-xl">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight">MediTrack</h1>
        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mt-1">
          EMS SUITE
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition duration-200 ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <div className="w-9 h-9 rounded-2xl bg-slate-900/70 flex items-center justify-center">
                <Icon size={17} />
              </div>

              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
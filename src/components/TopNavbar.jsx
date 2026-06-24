import { Bell, Search } from "lucide-react";

const TopNavbar = () => {
  return (
    <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
      <div className="relative w-85">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search employees..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell size={22} />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
            5
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            M
          </div>

          <div>
            <h4 className="font-semibold">Moaaz</h4>
            <p className="text-xs text-gray-500">
              Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
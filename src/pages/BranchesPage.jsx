import { useState } from "react";
import { Search, Plus } from "lucide-react";

import BranchCard from "../components/branches/BranchCard";
import AddBranchDrawer from "../components/branches/AddBranchDrawer";
import {
  branches,
  employees,
  getBranchEmployeeCount,
} from "../data";

const BranchesPage = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [search, setSearch] = useState("");

  const branchList = branches
    .map((branch) => ({
      ...branch,
      employees: getBranchEmployeeCount(branch.id, employees),
    }))
    .filter(
      (branch) =>
        search === "" ||
        branch.name.toLowerCase().includes(search.toLowerCase()) ||
        branch.city.toLowerCase().includes(search.toLowerCase()) ||
        branch.manager.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase">
              Branch Management
            </p>

            <h1 className="text-3xl font-bold mt-1">Branches</h1>

            <p className="text-slate-500 mt-1">
              Manage all company branches from one place.
            </p>
          </div>

          <button
            onClick={() => setOpenDrawer(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl font-medium shadow"
          >
            <Plus size={18} />
            Add Branch
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search branches..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {branchList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {branchList.map((branch) => (
              <BranchCard key={branch.id} {...branch} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-24">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                <Plus size={34} className="text-blue-600" />
              </div>

              <h2 className="text-2xl font-semibold mt-6">No Branches Found</h2>

              <p className="text-slate-500 mt-2">
                Start by creating your first branch.
              </p>

              <button
                onClick={() => setOpenDrawer(true)}
                className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-xl"
              >
                <Plus size={18} />
                Add Branch
              </button>
            </div>
          </div>
        )}
      </div>

      <AddBranchDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </>
  );
};

export default BranchesPage;

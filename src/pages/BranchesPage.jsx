import { useCallback, useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import toast from "react-hot-toast";

import BranchCard from "../components/branches/BranchCard";
import AddBranchDrawer from "../components/branches/AddBranchDrawer";
import * as branchService from "../services/branchService";

const BranchesPage = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBranches = useCallback(async (searchTerm = "") => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const { data } = await branchService.getBranches(params);
      setBranches(data || []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load branches.";
      setError(message);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBranches(search);
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, loadBranches]);

  const openCreate = () => {
    setEditingBranch(null);
    setOpenDrawer(true);
  };

  const openEdit = (branch) => {
    setEditingBranch(branch);
    setOpenDrawer(true);
  };

  const handleDelete = async (branch) => {
    const confirmed = window.confirm(
      `Delete branch "${branch.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await branchService.deleteBranch(branch._id);
      toast.success("Branch deleted");
      loadBranches(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete branch.");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase">
              Branch Management
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Branches</h1>

            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Manage all company branches from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-xl font-medium shadow w-full sm:w-auto"
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

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : branches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <BranchCard
                key={branch._id}
                {...branch}
                onView={() => openEdit(branch)}
                onEdit={() => openEdit(branch)}
                onDelete={() => handleDelete(branch)}
              />
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
                type="button"
                onClick={openCreate}
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
        branch={editingBranch}
        onClose={() => {
          setOpenDrawer(false);
          setEditingBranch(null);
        }}
        onSaved={() => loadBranches(search)}
      />
    </>
  );
};

export default BranchesPage;

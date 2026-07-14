import {
  Building2,
  Users,
  MapPin,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

const BranchCard = ({
  name,
  address,
  manager,
  employees,
  status,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6">
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Building2 size={28} className="text-blue-600" />
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status}
        </span>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mt-5">{name}</h2>

      <div className="flex items-center gap-2 mt-2 text-slate-500">
        <MapPin size={16} />
        <span className="text-sm">{address || "—"}</span>
      </div>

      <div className="border-t my-5" />

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-500">Branch Manager</span>
          <span className="font-semibold">{manager || "—"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Employees</span>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <span className="font-semibold">{employees ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        <button
          type="button"
          onClick={onView}
          className="flex items-center justify-center gap-2 rounded-xl border py-2 hover:bg-slate-50"
        >
          <Eye size={16} />
          View
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-2 rounded-xl border py-2 hover:bg-slate-50"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-2 rounded-xl border py-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default BranchCard;

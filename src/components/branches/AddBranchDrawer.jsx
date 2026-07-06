import { X, Building2 } from "lucide-react";

const AddBranchDrawer = ({ open, onClose }) => {
  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 transition-all duration-300 z-40 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}

      <div
        className={`fixed top-0 right-0 h-screen w-[520px] bg-white shadow-2xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="flex justify-between items-center px-6 py-5 border-b">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Add Branch
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Create a new company branch.
            </p>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="p-6 overflow-y-auto h-[calc(100vh-90px)]">

          {/* Branch Icon */}

          <div className="flex justify-center">

            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">

              <Building2
                size={42}
                className="text-blue-600"
              />

            </div>

          </div>

          {/* Form */}

          <div className="grid grid-cols-2 gap-5 mt-8">

            {/* Branch Name */}

            <div className="col-span-2">

              <label className="block mb-2 text-sm font-medium">
                Branch Name *
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Karachi Branch"
              />

            </div>

            {/* Branch Code */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Branch Code *
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3"
                placeholder="KHI-01"
              />

            </div>

            {/* Phone */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Phone Number
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3"
                placeholder="03XXXXXXXXX"
              />

            </div>

            {/* City */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                City *
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3"
                placeholder="Karachi"
              />

            </div>

            {/* Branch Manager */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Branch Manager
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3"
                placeholder="Ahmed Raza"
              />

            </div>

            {/* Address */}

            <div className="col-span-2">

              <label className="block mb-2 text-sm font-medium">
                Branch Address *
              </label>

              <textarea
                rows="3"
                className="w-full border rounded-xl px-4 py-3 resize-none"
                placeholder="Complete branch address..."
              />

            </div>

            {/* Opening Date */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Opening Date
              </label>

              <input
                type="date"
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            {/* Status */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Status
              </label>

              <select className="w-full border rounded-xl px-4 py-3">

                <option>Active</option>

                <option>Inactive</option>

              </select>

            </div>

          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 mt-8">

            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border hover:bg-slate-50"
            >
              Cancel
            </button>

            <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              Save Branch
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default AddBranchDrawer;
import { useRef, useState } from "react";
import { X, Camera, Upload } from "lucide-react";
import { branches, ROLES } from "../../data";

const AddEmployeeDrawer = ({ open, onClose }) => {
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

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
              Add Employee
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Create a new employee profile.
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

          {/* Photo */}

          <div className="flex flex-col items-center">

            <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 overflow-hidden bg-slate-100">

              {image ? (
                <img
                  src={image}
                  alt="Employee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">

                  <Camera
                    size={40}
                    className="text-slate-400"
                  />

                </div>
              )}

            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImage}
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-4 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition px-5 py-2 rounded-xl text-sm font-medium"
            >
              <Upload size={16} />
              Upload Photo
            </button>

          </div>

          {/* Form */}

          <div className="grid grid-cols-2 gap-5 mt-8">

            {/* Full Name */}

            <div className="col-span-2">

              <label className="block mb-2 text-sm font-medium">
                Full Name *
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmed Raza"
              />

            </div>

            {/* Employee ID */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Employee ID *
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3"
                placeholder="EMP-0001"
              />

            </div>

            {/* Phone */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Phone Number *
              </label>

              <input
                className="w-full border rounded-xl px-4 py-3"
                placeholder="03XXXXXXXXX"
              />

            </div>

            {/* Branch */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Branch *
              </label>

              <select className="w-full border rounded-xl px-4 py-3">
                <option>Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id}>{branch.name}</option>
                ))}
              </select>

            </div>

            {/* Designation */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Designation *
              </label>

              <select className="w-full border rounded-xl px-4 py-3">
                <option>Select Designation</option>
                <option>Branch Manager</option>
                <option>HR Executive</option>
                <option>Accountant</option>
                <option>Order Taker</option>
                <option>Dispatcher</option>
              </select>

            </div>

            {/* Employee Type */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Employee Type
              </label>

              <select className="w-full border rounded-xl px-4 py-3">
                <option>{ROLES.OFFICE_STAFF}</option>
                <option>{ROLES.ORDER_TAKER}</option>
                <option>{ROLES.DISPATCHER}</option>
              </select>

            </div>

            {/* Joining */}

            <div>

              <label className="block mb-2 text-sm font-medium">
                Joining Date
              </label>

              <input
                type="date"
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            {/* Status */}

            <div className="col-span-2">

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
              Save Employee
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default AddEmployeeDrawer;
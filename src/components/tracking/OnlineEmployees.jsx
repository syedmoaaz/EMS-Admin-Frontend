import {
  BatteryMedium,
  Wifi,
  Navigation,
  MapPin,
  ChevronRight,
} from "lucide-react";

const employees = [
  {
    id: 1,
    image: "https://i.pravatar.cc/150?img=15",
    name: "Ahmed Raza",
    designation: "Medical Representative",
    status: "Moving",
    battery: "78%",
    speed: "24 km/h",
    location: "Clifton, Karachi",
    updated: "10 sec ago",
  },
  {
    id: 2,
    image: "https://i.pravatar.cc/150?img=18",
    name: "Ali Khan",
    designation: "Order Booker",
    status: "Stationary",
    battery: "63%",
    speed: "0 km/h",
    location: "DHA Phase 6",
    updated: "18 sec ago",
  },
  {
    id: 3,
    image: "https://i.pravatar.cc/150?img=32",
    name: "Bilal Ahmed",
    designation: "Dispatcher",
    status: "GPS Disabled",
    battery: "51%",
    speed: "--",
    location: "--",
    updated: "2 mins ago",
  },
];

const statusColor = (status) => {
  switch (status) {
    case "Moving":
      return "bg-green-100 text-green-700";

    case "Stationary":
      return "bg-blue-100 text-blue-700";

    case "GPS Disabled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const OnlineEmployees = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-[650px] flex flex-col">

      {/* Header */}

      <div className="px-5 py-5 border-b">

        <h2 className="text-xl font-bold">
          Live Employees
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Real-time field employee tracking.
        </p>

      </div>

      {/* List */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {employees.map((emp) => (

          <div
            key={emp.id}
            className="border rounded-2xl p-4 hover:shadow-md transition cursor-pointer"
          >

            {/* Top */}

            <div className="flex justify-between">

              <div className="flex gap-3">

                <img
                  src={emp.image}
                  className="w-14 h-14 rounded-full object-cover"
                  alt=""
                />

                <div>

                  <h3 className="font-semibold">
                    {emp.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {emp.designation}
                  </p>

                </div>

              </div>

              <ChevronRight
                size={18}
                className="text-slate-400"
              />

            </div>

            {/* Status */}

            <div className="mt-4">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                  emp.status
                )}`}
              >
                {emp.status}
              </span>

            </div>

            {/* Details */}

            <div className="grid grid-cols-2 gap-3 mt-5 text-sm">

              <div className="flex items-center gap-2">

                <BatteryMedium
                  size={16}
                  className="text-green-600"
                />

                {emp.battery}

              </div>

              <div className="flex items-center gap-2">

                <Navigation
                  size={16}
                  className="text-blue-600"
                />

                {emp.speed}

              </div>

              <div className="flex items-center gap-2">

                <Wifi
                  size={16}
                  className="text-indigo-600"
                />

                Online

              </div>

              <div className="flex items-center gap-2">

                <MapPin
                  size={16}
                  className="text-red-500"
                />

                {emp.updated}

              </div>

            </div>

            {/* Location */}

            <div className="mt-4 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-600">

              📍 {emp.location}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default OnlineEmployees;
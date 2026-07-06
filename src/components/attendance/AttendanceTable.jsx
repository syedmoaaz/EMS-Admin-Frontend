import {
  Eye,
  Fingerprint,
  Smartphone,
} from "lucide-react";

const attendanceData = [
  {
    id: 1,
    image: "https://i.pravatar.cc/150?img=12",
    name: "Ahmed Raza",
    employeeId: "EMP-0001",
    branch: "Head Office",
    checkIn: "09:02 AM",
    checkOut: "06:10 PM",
    hours: "9h 08m",
    method: "Biometric",
    status: "Present",
  },
  {
    id: 2,
    image: "https://i.pravatar.cc/150?img=18",
    name: "Ali Khan",
    employeeId: "EMP-0002",
    branch: "Karachi Branch",
    checkIn: "09:21 AM",
    checkOut: "--",
    hours: "Working",
    method: "GPS",
    status: "Working",
  },
  {
    id: 3,
    image: "https://i.pravatar.cc/150?img=25",
    name: "Bilal Ahmed",
    employeeId: "EMP-0003",
    branch: "Lahore Branch",
    checkIn: "--",
    checkOut: "--",
    hours: "--",
    method: "--",
    status: "Absent",
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-700";

    case "Working":
      return "bg-blue-100 text-blue-700";

    case "Absent":
      return "bg-red-100 text-red-700";

    case "Late":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

const AttendanceTable = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}

      <div className="px-6 py-5 border-b">

        <h2 className="text-xl font-bold">
          Today's Attendance
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Live attendance across all branches.
        </p>

      </div>

      {/* Table */}

      <table className="w-full">

        <thead className="bg-slate-50">

          <tr className="text-left text-sm">

            <th className="px-6 py-4">Employee</th>

            <th>Branch</th>

            <th>Check In</th>

            <th>Check Out</th>

            <th>Hours</th>

            <th>Method</th>

            <th>Status</th>

            <th className="text-center">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {attendanceData.map((employee) => (

            <tr
              key={employee.id}
              className="border-t hover:bg-slate-50 transition"
            >

              {/* Employee */}

              <td className="px-6 py-4">

                <div className="flex items-center gap-3">

                  <img
                    src={employee.image}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div>

                    <h4 className="font-semibold">
                      {employee.name}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {employee.employeeId}
                    </p>

                  </div>

                </div>

              </td>

              {/* Branch */}

              <td>{employee.branch}</td>

              {/* Check In */}

              <td>{employee.checkIn}</td>

              {/* Check Out */}

              <td>{employee.checkOut}</td>

              {/* Hours */}

              <td>{employee.hours}</td>

              {/* Method */}

              <td>

                {employee.method === "Biometric" && (

                  <div className="flex items-center gap-2">

                    <Fingerprint
                      size={16}
                      className="text-blue-600"
                    />

                    Biometric

                  </div>

                )}

                {employee.method === "GPS" && (

                  <div className="flex items-center gap-2">

                    <Smartphone
                      size={16}
                      className="text-green-600"
                    />

                    GPS

                  </div>

                )}

                {employee.method === "--" && "--"}

              </td>

              {/* Status */}

              <td>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                    employee.status
                  )}`}
                >
                  {employee.status}
                </span>

              </td>

              {/* Action */}

              <td className="text-center">

                <button className="w-9 h-9 rounded-xl border hover:bg-slate-100 inline-flex items-center justify-center">

                  <Eye size={17} />

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default AttendanceTable;
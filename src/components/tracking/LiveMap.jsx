import {
  MapPinned,
  Navigation,
  LocateFixed,
  Move,
} from "lucide-react";
import { getLiveEmployees } from "../../data";

const markerPositions = [
  "top-28 left-36",
  "top-56 right-44",
  "top-40 left-1/2",
  "bottom-44 left-60",
  "bottom-32 right-36",
  "top-20 right-1/3",
  "bottom-56 left-1/3",
  "top-1/2 right-24",
];

const markerIcons = {
  Moving: { Icon: Navigation, color: "text-green-600" },
  Stationary: { Icon: Move, color: "text-orange-500" },
  "GPS Disabled": { Icon: Move, color: "text-red-500" },
  Offline: { Icon: Move, color: "text-slate-400" },
};

const LiveMap = () => {
  const employees = getLiveEmployees().filter((emp) => emp.location !== "--");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px]">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Tracking Map</h2>

          <p className="text-sm text-slate-500 mt-1">
            Monitor all field employees in real time.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50">
          <LocateFixed size={18} />
          My Location
        </button>
      </div>

      <div className="relative h-[calc(100%-80px)] bg-slate-100 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg,#d1d5db 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {employees.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPinned size={46} className="text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold mt-6">Google Maps / Leaflet</h3>

            <p className="text-slate-500 mt-2">
              Live employee locations will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl px-4 py-2 text-sm font-medium shadow-sm">
              {employees.length} employees on map
            </div>

            {employees.map((emp, index) => {
              const marker = markerIcons[emp.status] ?? markerIcons.Moving;
              const { Icon, color } = marker;
              const firstName = emp.name.split(" ")[0];

              return (
                <div
                  key={emp.id}
                  className={`absolute ${markerPositions[index % markerPositions.length]}`}
                >
                  <div className="flex flex-col items-center">
                    <Icon size={24} className={color} />
                    <span className="text-xs font-semibold mt-1 bg-white/80 px-2 py-0.5 rounded">
                      {firstName}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default LiveMap;

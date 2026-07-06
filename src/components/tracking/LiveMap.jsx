import {
  MapPinned,
  Navigation,
  LocateFixed,
  Move,
} from "lucide-react";

const LiveMap = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px]">

      {/* Header */}

      <div className="flex items-center justify-between px-6 py-5 border-b">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Live Tracking Map
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Monitor all field employees in real time.
          </p>

        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50">

          <LocateFixed size={18} />

          My Location

        </button>

      </div>

      {/* Map */}

      <div className="relative h-full bg-slate-100 overflow-hidden">

        {/* Grid Background */}

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg,#d1d5db 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Center Placeholder */}

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">

            <MapPinned
              size={46}
              className="text-blue-600"
            />

          </div>

          <h3 className="text-2xl font-bold mt-6">
            Google Maps / Leaflet
          </h3>

          <p className="text-slate-500 mt-2">
            Live employee locations will appear here.
          </p>

        </div>

        {/* Dummy Employee Markers */}

        <div className="absolute top-28 left-36">

          <div className="flex flex-col items-center">

            <Navigation
              size={24}
              className="text-green-600"
            />

            <span className="text-xs font-semibold mt-1">
              Ahmed
            </span>

          </div>

        </div>

        <div className="absolute top-56 right-44">

          <div className="flex flex-col items-center">

            <Navigation
              size={24}
              className="text-blue-600"
            />

            <span className="text-xs font-semibold mt-1">
              Ali
            </span>

          </div>

        </div>

        <div className="absolute bottom-44 left-60">

          <div className="flex flex-col items-center">

            <Move
              size={24}
              className="text-orange-500"
            />

            <span className="text-xs font-semibold mt-1">
              Bilal
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LiveMap;
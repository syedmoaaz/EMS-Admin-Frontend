import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPinned, LocateFixed } from "lucide-react";

const statusColors = {
  Moving: "#16a34a",
  Stationary: "#f97316",
  "GPS Disabled": "#ef4444",
  Offline: "#94a3b8",
};

const createMarkerIcon = (status, name) => {
  const color = statusColors[status] || "#2563eb";
  const label = (name || "E").split(" ")[0];

  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
        <span style="margin-top:4px;background:rgba(255,255,255,0.95);padding:2px 6px;border-radius:8px;font-size:11px;font-weight:600;color:#0f172a;box-shadow:0 1px 3px rgba(0,0,0,0.15);white-space:nowrap;">${label}</span>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 10],
  });
};

const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
  }, [map, points]);

  return null;
};

const LiveMap = ({ records = [], onSelect, selectedId }) => {
  const mapped = useMemo(
    () =>
      records.filter(
        (record) =>
          typeof record.lat === "number" &&
          typeof record.lng === "number" &&
          !Number.isNaN(record.lat) &&
          !Number.isNaN(record.lng)
      ),
    [records]
  );

  const points = useMemo(
    () => mapped.map((record) => [record.lat, record.lng]),
    [mapped]
  );

  const defaultCenter = points[0] || [25.396, 68.3578];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[650px]">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Tracking Map</h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor all field employees in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <LocateFixed size={18} />
          {mapped.length} on map
        </div>
      </div>

      <div className="relative h-[calc(100%-80px)] bg-slate-100 overflow-hidden">
        {mapped.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPinned size={46} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mt-6">No live locations</h3>
            <p className="text-slate-500 mt-2">
              Field employees with GPS coordinates will appear here.
            </p>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={11}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={points} />

            {mapped.map((record) => {
              const emp = record.employee || {};
              const isSelected =
                selectedId &&
                (selectedId === record._id ||
                  selectedId === emp._id ||
                  selectedId === record.employee);

              return (
                <Marker
                  key={record._id}
                  position={[record.lat, record.lng]}
                  icon={createMarkerIcon(record.status, emp.name)}
                  eventHandlers={{
                    click: () => onSelect?.(record),
                  }}
                  opacity={isSelected === false ? 0.7 : 1}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{emp.name || "Employee"}</p>
                      <p className="text-slate-600">{record.status}</p>
                      <p className="text-slate-500 mt-1">
                        {record.location || "—"}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default LiveMap;

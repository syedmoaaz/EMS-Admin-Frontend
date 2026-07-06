import {
  Users,
  Car,
  PauseCircle,
  WifiOff,
} from "lucide-react";

import TrackingStatsCard from "../components/tracking/TrackingStatsCard";
import TrackingFilters from "../components/tracking/TrackingFilters";
import LiveMap from "../components/tracking/LiveMap";
import OnlineEmployees from "../components/tracking/OnlineEmployees";

const stats = [
  {
    title: "Online Employees",
    value: 24,
    icon: Users,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    change: "+2",
  },
  {
    title: "Moving",
    value: 18,
    icon: Car,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    change: "+4",
  },
  {
    title: "Stationary",
    value: 4,
    icon: PauseCircle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    change: "-1",
    positive: false,
  },
  {
    title: "Offline",
    value: 2,
    icon: WifiOff,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    change: "+1",
    positive: false,
  },
];

const LiveTrackingPage = () => {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div>

        <p className="text-blue-600 font-semibold text-sm uppercase">
          Live Tracking
        </p>

        <h1 className="text-3xl font-bold mt-1">
          Field Employee Tracking
        </h1>

        <p className="text-slate-500 mt-1">
          Monitor all field employees in real time.
        </p>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-5">

        {stats.map((item) => (
          <TrackingStatsCard
            key={item.title}
            {...item}
          />
        ))}

      </div>

      <TrackingFilters />

      {/* Main Layout */}

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-8">

          <LiveMap />

        </div>

        <div className="col-span-4">

          <OnlineEmployees />

        </div>

      </div>

    </div>
  );
};

export default LiveTrackingPage;
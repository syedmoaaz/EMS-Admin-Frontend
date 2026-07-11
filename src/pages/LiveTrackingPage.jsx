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
import { getTrackingStats } from "../data";

const LiveTrackingPage = () => {
  const trackingStats = getTrackingStats();

  const stats = [
    {
      title: "Online Employees",
      value: trackingStats.online,
      icon: Users,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      change: "+2",
    },
    {
      title: "Moving",
      value: trackingStats.moving,
      icon: Car,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      change: "+4",
    },
    {
      title: "Stationary",
      value: trackingStats.stationary,
      icon: PauseCircle,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      change: "-1",
      positive: false,
    },
    {
      title: "Offline",
      value: trackingStats.offline,
      icon: WifiOff,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      change: "+1",
      positive: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-blue-600 font-semibold text-sm uppercase">
          Live Tracking
        </p>

        <h1 className="text-3xl font-bold mt-1">Field Employee Tracking</h1>

        <p className="text-slate-500 mt-1">
          Monitor all field employees in real time.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((item) => (
          <TrackingStatsCard key={item.title} {...item} />
        ))}
      </div>

      <TrackingFilters />

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

import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const AttendanceStatsCard = ({
  icon: Icon,
  title,
  value,
  iconBg,
  iconColor,
  change,
  positive = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_6px_rgba(0,0,0,0.05)] p-4 h-[170px] hover:shadow-md transition">

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon
          size={21}
          className={iconColor}
        />
      </div>

      <h2 className="text-[30px] font-bold mt-5 text-slate-900">
        {value}
      </h2>

      <p className="text-sm text-slate-600 mt-1 font-medium">
        {title}
      </p>

      <div className="flex items-center gap-1 mt-5 text-xs">

        {positive ? (
          <TrendingUp
            size={15}
            className="text-green-500"
          />
        ) : (
          <TrendingDown
            size={15}
            className="text-red-500"
          />
        )}

        <span
          className={`font-semibold ${
            positive
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {change}
        </span>

        <span className="text-slate-500">
          vs yesterday
        </span>

      </div>

    </div>
  );
};

export default AttendanceStatsCard;
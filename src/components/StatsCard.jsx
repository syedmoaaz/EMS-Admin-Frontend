import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  icon: Icon,
  title,
  value,
  change,
  changeText,
  positive = true,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">

      {/* Icon */}

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}
      >
        <Icon size={24} className={iconColor} />
      </div>

      {/* Number */}

      <h2 className="text-[42px] font-bold text-slate-900 mt-6 leading-none">
        {value}
      </h2>

      {/* Title */}

      <p className="text-slate-600 mt-3 text-lg">
        {title}
      </p>

      {/* Growth */}

      <div className="flex items-center gap-1 mt-5 text-sm">

        {positive ? (
          <TrendingUp
            size={16}
            className="text-green-500"
          />
        ) : (
          <TrendingDown
            size={16}
            className="text-red-500"
          />
        )}

        <span
          className={`font-semibold ${
            positive ? "text-green-600" : "text-red-500"
          }`}
        >
          {change}
        </span>

        <span className="text-slate-500">
          {changeText}
        </span>

      </div>

    </div>
  );
};

export default StatsCard;
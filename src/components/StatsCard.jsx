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
<div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.05)] p-4 h-[185px] hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition-all duration-300">

      {/* Icon */}

     <div
  className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}
>
        <Icon size={21} className={iconColor} />
      </div>

      {/* Number */}

    <h2 className="text-[32px] font-bold text-slate-900 mt-5 leading-none">
        {value}
      </h2>

      {/* Title */}

<p className="text-[14px] font-medium text-slate-600 mt-2 leading-5 min-h-[40px]">
        {title}
      </p>

      {/* Growth */}

  <div className="flex items-center gap-1 mt-5 text-[13px]">

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
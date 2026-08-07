import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
} from "lucide-react";

/**
 * ==========================================================
 * Premium Metric Card
 * ----------------------------------------------------------
 * Props:
 * title      : Card title
 * value      : Main value
 * unit       : Optional unit
 * icon       : Lucide Icon
 * color      : Tailwind background color
 * trend      : +12% / -5%
 * progress   : 0-100
 * status     : Healthy / Warning / Critical
 * updated    : Last updated time
 * ==========================================================
 */

const MetricCard = ({
  title,
  value,
  unit = "",
  icon: Icon,
  color = "bg-blue-600",
  trend = "+0%",
  progress = 50,
  status = "Healthy",
  updated = "Just now",
}) => {
  const positive = trend.startsWith("+");

  const statusColor =
    status === "Healthy"
      ? "bg-emerald-500"
      : status === "Warning"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-blue-500/40
        hover:shadow-2xl
        hover:shadow-blue-500/10
      "
    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

      {/* Top Section */}
      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400 font-medium">
            {title}
          </p>

          <div className="mt-3 flex items-end gap-2">

            <h2 className="text-4xl font-bold text-white">
              {value}
            </h2>

            {unit && (
              <span className="pb-1 text-sm text-slate-400">
                {unit}
              </span>
            )}

          </div>

        </div>

        <div
          className={`
            ${color}
            h-16
            w-16
            rounded-2xl
            flex
            items-center
            justify-center
            shadow-lg
          `}
        >
          {Icon && <Icon className="text-white" size={30} />}
        </div>

      </div>

      {/* Progress */}
      <div className="mt-7">

        <div className="flex justify-between text-sm mb-2">

          <span className="text-slate-400">
            Health
          </span>

          <span className="text-white font-semibold">
            {progress}%
          </span>

        </div>

        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

      {/* Bottom */}
      <div className="mt-6 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`h-3 w-3 rounded-full ${statusColor}`}
          />

          <span className="text-sm font-medium text-slate-300">
            {status}
          </span>

        </div>

        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            positive
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={16} />
          ) : (
            <ArrowDownRight size={16} />
          )}

          {trend}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-5 border-t border-slate-800 pt-4 flex items-center gap-2 text-xs text-slate-500">

        <Clock3 size={14} />

        Updated {updated}

      </div>

    </div>
  );
};

export default MetricCard;
import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
} from "lucide-react";

const MetricCard = ({
  title,
  value,
  unit = "",
  icon: Icon,
  color = "bg-blue-600",

  // Optional sections
  showProgress = true,
  showTrend = true,

  trend = "+0%",
  progress = 50,
  progressLabel = "Health",

  status = "Healthy",
  updated = "Just now",
}) => {
  const trendValue =
    Number.parseFloat(trend);

  const positive =
    !Number.isNaN(trendValue) &&
    trendValue > 0;

  const negative =
    !Number.isNaN(trendValue) &&
    trendValue < 0;

  const statusColor =
    status === "Healthy" ||
    status === "Normal" ||
    status === "Monitoring" ||
    status === "Detected" ||
    status === "Live data"
      ? "bg-emerald-500"
      : status === "Warning"
        ? "bg-yellow-500"
        : status === "Loading" ||
            status === "Last captured" ||
            status === "Inactive" ||
            status === "No activity"
          ? "bg-slate-400"
          : "bg-red-500";

  const safeProgress = Math.min(
    100,
    Math.max(
      0,
      Number(progress) || 0
    )
  );

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-md
      "
    >

      {/* Background Glow */}

      <div
        className="
          absolute
          -top-10
          -right-10
          h-32
          w-32
          bg-blue-500/10
          blur-3xl
          transition-all
          group-hover:bg-blue-500/20
        "
      />


      {/* Top Section */}

      <div
        className="
          relative
          flex
          items-start
          justify-between
        "
      >

        <div>

          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {title}
          </p>

          <div
            className="
              mt-0.5
              flex
              items-end
              gap-2
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-slate-800
              "
            >
              {value}
            </h2>

            {unit && (
              <span
                className="
                  pb-1
                  text-sm
                  text-slate-500
                "
              >
                {unit}
              </span>
            )}

          </div>

        </div>


        {/* Icon */}

        <div
          className={`
            ${color}
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            shadow-lg
          `}
        >
          {Icon && (
            <Icon
              className="text-white"
              size={30}
            />
          )}
        </div>

      </div>


      {/* ======================================================
          PROGRESS
      ====================================================== */}

      {showProgress && (
        <div className="mt-2">

          <div
            className="
              mb-2
              flex
              justify-between
              text-sm
            "
          >

            <span className="text-slate-500">
              {progressLabel}
            </span>

            <span
              className="
                font-semibold
                text-slate-800
              "
            >
              {Math.round(
                safeProgress
              )}
              %
            </span>

          </div>

          <div
            className="
              h-2
              overflow-hidden
              rounded-full
              bg-slate-100
            "
          >

            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                via-blue-500
                to-indigo-500
                transition-all
                duration-1000
              "
              style={{
                width: `${safeProgress}%`,
              }}
            />

          </div>

        </div>
      )}


      {/* ======================================================
          STATUS + TREND
      ====================================================== */}

      <div
        className={`
          mt-4
          flex
          items-center
          ${
            showTrend
              ? "justify-between"
              : "justify-start"
          }
        `}
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className={`
              h-3
              w-3
              rounded-full
              ${statusColor}
            `}
          />

          <span
            className="
              text-sm
              font-medium
              text-slate-600
            "
          >
            {status}
          </span>

        </div>


        {showTrend && (
          <div
            className={`
              flex
              items-center
              gap-1
              text-sm
              font-semibold
              ${
                positive
                  ? "text-emerald-500"
                  : negative
                    ? "text-red-500"
                    : "text-slate-400"
              }
            `}
          >

            {positive && (
              <ArrowUpRight size={16} />
            )}

            {negative && (
              <ArrowDownRight size={16} />
            )}

            {trend}

          </div>
        )}

      </div>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          gap-2
          border-t
          border-slate-100
          pt-2
          text-xs
          text-slate-500
        "
      >

        <Clock3 size={14} />

        Updated {updated}

      </div>

    </div>
  );
};

export default MetricCard;
import React from "react";

/* =========================================================
   FORMAT DURATION
========================================================= */

const formatDuration = (seconds) => {
  const value = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = Math.floor(value % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
};

/* =========================================================
   ACTIVITY SUMMARY
========================================================= */

const ActivitySummary = ({
  metrics,
  currentApplication,
  monitoringActive,
  activityLive,
  latest,
  lastUpdated,
  latestRecordTime,
}) => {
  const active = Number(metrics?.activeTimeSeconds) || 0;
  const idle = Number(metrics?.idleTimeSeconds) || 0;

  const keyboard = Number(latest?.keyboard_count) || 0;
  const mouse = Number(latest?.mouse_clicks) || 0;
  const screenTime = Number(latest?.screen_time) || 0;

  const total = active + idle;

  const activePercentage =
    total > 0
      ? Math.round((active / total) * 100)
      : 0;

  const idlePercentage =
    total > 0
      ? Math.round((idle / total) * 100)
      : 0;

  const updatedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  const applicationTime =
    latestRecordTime
      ? latestRecordTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-100 px-6 py-5">

        <div className="flex items-center gap-4">

          {/* ICON */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">

            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h4l2-6 4 12 2-6h6" />
            </svg>

          </div>

          {/* TITLE */}

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Activity Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current desktop activity and monitoring state
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

        {/* ===================================================
            ACTIVE
        =================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

          <div className="flex items-center justify-between">

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Time
            </span>

            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
              {activePercentage}%
            </span>

          </div>

          <div className="mt-3 flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>

            </div>

            <p className="text-2xl font-bold text-slate-900">
              {formatDuration(active)}
            </p>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${activePercentage}%`,
              }}
            />

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Latest active interval
          </p>

        </div>

        {/* ===================================================
            IDLE
        =================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

          <div className="flex items-center justify-between">

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Idle Time
            </span>

            <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
              {idlePercentage}%
            </span>

          </div>

          <div className="mt-3 flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>

            </div>

            <p className="text-2xl font-bold text-slate-900">
              {formatDuration(idle)}
            </p>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{
                width: `${idlePercentage}%`,
              }}
            />

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Latest idle interval
          </p>

        </div>

        {/* ===================================================
            CURRENT APPLICATION
        =================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Application
          </span>

          <div className="mt-3 flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="13"
                  rx="2"
                />

                <path d="M8 21h8" />
                <path d="M12 17v4" />

              </svg>

            </div>

            <p className="truncate text-lg font-bold text-slate-900">
              {currentApplication || "No active application"}
            </p>

          </div>

          <p className="mt-3 truncate text-xs text-slate-400">

            {activityLive
              ? "Currently being monitored"
              : applicationTime
                ? `Captured at ${applicationTime}`
                : "No recent application data"}

          </p>

        </div>

      </div>

      {/* =====================================================
          STATUS FOOTER
      ===================================================== */}

      <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* LEFT STATUS */}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">

            {/* MONITORING */}

            <div className="flex items-center gap-2">

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  monitoringActive
                    ? "animate-pulse bg-emerald-500"
                    : "bg-slate-300"
                }`}
              />

              <span className="text-sm font-semibold text-slate-700">

                {monitoringActive
                  ? "Desktop monitoring active"
                  : "Desktop monitoring inactive"}

              </span>

            </div>

            <div className="hidden h-4 w-px bg-slate-200 sm:block" />

            {/* KEYBOARD */}

            <div className="text-xs text-slate-500">

              Keyboard{" "}

              <span className="font-semibold text-slate-700">
                {keyboard.toLocaleString()}
              </span>

            </div>

            {/* MOUSE */}

            <div className="text-xs text-slate-500">

              Mouse{" "}

              <span className="font-semibold text-slate-700">
                {mouse.toLocaleString()}
              </span>

            </div>

            {/* SCREEN */}

            <div className="text-xs text-slate-500">

              Screen{" "}

              <span className="font-semibold text-slate-700">
                {formatDuration(screenTime)}
              </span>

            </div>

          </div>

          {/* RIGHT STATUS */}

          <div className="flex flex-wrap items-center gap-3">

            {/* LIVE / CAPTURED */}

            <span
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                activityLive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {activityLive
                ? "Live data"
                : "Last captured"}
            </span>

            {/* UPDATED */}

            <span className="text-[11px] text-slate-400">
              Updated {updatedTime}
            </span>

          </div>

        </div>

      </div>

    </section>
  );
};

export default ActivitySummary;
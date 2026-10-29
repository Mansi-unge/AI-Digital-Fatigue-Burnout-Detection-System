import React from "react";
import {
  Code2,
  Globe,
  Coffee,
  Play,
  BrainCircuit,
  MousePointer2,
  Keyboard,
  Monitor,
  Clock3,
} from "lucide-react";

/* =========================================================
   TIMESTAMP NORMALIZATION
========================================================= */

const normalizeTimestamp = (record) => {
  const raw =
    record?.created_at ||
    record?.timestamp ||
    record?.recorded_at ||
    record?.updated_at;

  if (!raw) return null;

  let value = String(raw).trim();

  // Backend returns UTC timestamps without timezone information.
  if (
    value.includes("T") &&
    !value.endsWith("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(value)
  ) {
    value += "Z";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

/* =========================================================
   ACTIVITY FEED
========================================================= */

const ActivityFeed = ({ activities = [] }) => {
  /* -------------------------------------------------------
     SHOW ONLY LATEST 5 ACTIVITIES
  ------------------------------------------------------- */

  const recentActivities = activities.slice(0, 5);

  /* -------------------------------------------------------
     ACTIVITY CLASSIFICATION
  ------------------------------------------------------- */

  const getActivityDetails = (activity) => {
    const app = activity?.active_application || "Unknown";

    const keyboard = Number(activity?.keyboard_count || 0);
    const mouse = Number(activity?.mouse_clicks || 0);
    const idle = Number(activity?.idle_time || 0);
    const active = Number(activity?.active_time || 0);

    /* =====================================================
       IDLE
    ===================================================== */

    if (idle > 0 && active <= 0) {
      return {
        title: "Idle Period",
        description: "User activity paused",
        icon: Coffee,
        iconStyle: "bg-amber-50 text-amber-600",
      };
    }

    /* =====================================================
       APPLICATION
    ===================================================== */

    if (app !== "Unknown") {
      const lowerApp = app.toLowerCase();

      /* VS CODE */

      if (
        lowerApp.includes("code") ||
        lowerApp.includes("visual studio")
      ) {
        return {
          title: "VS Code Active",
          description: "Development activity detected",
          icon: Code2,
          iconStyle: "bg-blue-50 text-blue-600",
        };
      }

      /* BROWSER */

      if (
        lowerApp.includes("chrome") ||
        lowerApp.includes("edge") ||
        lowerApp.includes("firefox")
      ) {
        return {
          title: `${app} Active`,
          description: "Browser activity detected",
          icon: Globe,
          iconStyle: "bg-purple-50 text-purple-600",
        };
      }

      /* OTHER APPLICATION */

      return {
        title: `${app} Active`,
        description: "Desktop application activity detected",
        icon: Monitor,
        iconStyle: "bg-blue-50 text-blue-600",
      };
    }

    /* =====================================================
       KEYBOARD
    ===================================================== */

    if (keyboard > 0) {
      return {
        title: "Keyboard Activity",
        description: `${keyboard} keyboard presses detected`,
        icon: Keyboard,
        iconStyle: "bg-blue-50 text-blue-600",
      };
    }

    /* =====================================================
       MOUSE
    ===================================================== */

    if (mouse > 0) {
      return {
        title: "Mouse Activity",
        description: `${mouse} mouse clicks detected`,
        icon: MousePointer2,
        iconStyle: "bg-purple-50 text-purple-600",
      };
    }

    /* =====================================================
       DEFAULT
    ===================================================== */

    return {
      title: "Activity Detected",
      description: "Desktop activity detected",
      icon: Play,
      iconStyle: "bg-emerald-50 text-emerald-600",
    };
  };

  /* -------------------------------------------------------
     FORMAT TIME
  ------------------------------------------------------- */

  const formatTime = (timestamp) => {
    if (!timestamp) return "--:--";

    let normalizedTimestamp = String(timestamp).trim();

    // Backend currently returns UTC timestamps without
    // timezone information.
    //
    // Example:
    // 2026-09-19T17:57:00
    //
    // Treat timezone-less ISO timestamps as UTC.

    if (
      normalizedTimestamp.includes("T") &&
      !normalizedTimestamp.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(normalizedTimestamp)
    ) {
      normalizedTimestamp += "Z";
    }

    const date = new Date(normalizedTimestamp);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =======================================================
     NO DATA STATE
  ======================================================= */

  if (recentActivities.length === 0) {
    return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}

        <div className="border-b border-slate-100 p-5 sm:p-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest behavioural events
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Clock3 size={18} />
            </div>

          </div>

        </div>

        {/* EMPTY STATE */}

        <div className="flex min-h-[300px] items-center justify-center p-8">

          <div className="text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <BrainCircuit
                size={22}
                className="text-slate-400"
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No activity yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Activity will appear here when monitoring starts.
            </p>

          </div>

        </div>

      </section>
    );
  }

  /* =======================================================
     MAIN FEED
  ======================================================= */

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest behavioural events
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Clock3 size={18} />
          </div>

        </div>

      </div>

      {/* ===================================================
          FEED
      =================================================== */}

      <div className="max-h-[365px] overflow-y-auto">

        <div className="p-5 sm:p-6">

          <div className="space-y-5">

            {recentActivities.map((activity, index) => {

              const {
                title,
                description,
                icon: Icon,
                iconStyle,
              } = getActivityDetails(activity);

              const date = normalizeTimestamp(activity);

              const time = date
                ? date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : formatTime(activity?.created_at);

              return (
                <div
                  key={
                    activity?.id ??
                    activity?.activity_id ??
                    `${activity?.created_at}-${index}`
                  }
                  className="group relative flex gap-4"
                >

                  {/* =========================================
                      TIMELINE LINE
                  ========================================= */}

                  {index !== recentActivities.length - 1 && (
                    <div
                      className="
                        absolute
                        left-5
                        top-11
                        h-[calc(100%+8px)]
                        w-px
                        bg-slate-200
                      "
                    />
                  )}

                  {/* =========================================
                      ICON
                  ========================================= */}

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      transition
                      group-hover:scale-105
                      ${iconStyle}
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  {/* =========================================
                      CONTENT
                  ========================================= */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="truncate text-sm font-semibold text-slate-800">
                          {title}
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {description}
                        </p>

                      </div>

                      {/* TIME */}

                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-slate-400">

                        <Clock3 size={11} />

                        {time}

                      </span>

                    </div>

                    {/* =======================================
                        APPLICATION BADGE
                    ======================================= */}

                    {activity?.active_application &&
                      activity.active_application !== "Unknown" && (
                        <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">

                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                          <span className="truncate">
                            {activity.active_application}
                          </span>

                        </div>
                      )}

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </section>
  );
};

export default ActivityFeed;
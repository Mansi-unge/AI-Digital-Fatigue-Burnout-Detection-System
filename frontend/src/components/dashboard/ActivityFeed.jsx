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
} from "lucide-react";

const ActivityFeed = ({ activities = [] }) => {
  const getActivityDetails = (activity) => {
    const app = activity?.active_application || "Unknown";
    const keyboard = Number(activity?.keyboard_count || 0);
    const mouse = Number(activity?.mouse_clicks || 0);
    const idle = Number(activity?.idle_time || 0);
    const active = Number(activity?.active_time || 0);

    // ----------------------------------------------------------
    // IDLE
    // ----------------------------------------------------------
    if (idle > 0 && active <= 0) {
      return {
        title: "Idle Period",
        description: "User activity paused",
        icon: Coffee,
        iconStyle: "bg-amber-50 text-amber-600",
      };
    }

    // ----------------------------------------------------------
    // APPLICATION
    // ----------------------------------------------------------
    if (app !== "Unknown") {
      const lowerApp = app.toLowerCase();

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

      return {
        title: `${app} Active`,
        description: "Desktop application activity detected",
        icon: Monitor,
        iconStyle: "bg-blue-50 text-blue-600",
      };
    }

    // ----------------------------------------------------------
    // KEYBOARD
    // ----------------------------------------------------------
    if (keyboard > 0) {
      return {
        title: "Keyboard Activity",
        description: `${keyboard} keyboard presses detected`,
        icon: Keyboard,
        iconStyle: "bg-blue-50 text-blue-600",
      };
    }

    // ----------------------------------------------------------
    // MOUSE
    // ----------------------------------------------------------
    if (mouse > 0) {
      return {
        title: "Mouse Activity",
        description: `${mouse} mouse clicks detected`,
        icon: MousePointer2,
        iconStyle: "bg-purple-50 text-purple-600",
      };
    }

    // ----------------------------------------------------------
    // DEFAULT
    // ----------------------------------------------------------
    return {
      title: "Activity Detected",
      description: "Desktop activity detected",
      icon: Play,
      iconStyle: "bg-emerald-50 text-emerald-600",
    };
  };

  const formatTime = (timestamp) => {
  if (!timestamp) return "--";

  let normalizedTimestamp = String(timestamp).trim();

  // Backend currently returns UTC timestamps without timezone information.
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
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  // Show only the latest 5 activities
  const recentActivities = activities.slice(0, 5);

  // ----------------------------------------------------------
  // NO DATA
  // ----------------------------------------------------------
  if (recentActivities.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          <BrainCircuit size={18} className="text-slate-400" />
        </div>

        <p className="text-sm font-medium text-slate-600">
          No activity yet
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Activity will appear here when monitoring starts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {recentActivities.map((activity, index) => {
        const {
          title,
          description,
          icon: Icon,
          iconStyle,
        } = getActivityDetails(activity);

        return (
          <div
            key={activity.id ?? `${activity.created_at}-${index}`}
            className="relative flex gap-4"
          >
            {/* Timeline line */}
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

            {/* Icon */}
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
                ${iconStyle}
              `}
            >
              <Icon size={20} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  {title}
                </h3>

                <span className="shrink-0 text-xs text-slate-400">
                  {formatTime(activity.created_at)}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;

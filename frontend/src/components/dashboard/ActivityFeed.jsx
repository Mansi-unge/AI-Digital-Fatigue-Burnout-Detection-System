import React from "react";
import {
  Code2,
  Globe,
  Coffee,
  Play,
  BrainCircuit,
} from "lucide-react";

const activities = [
  {
    time: "09:30 AM",
    title: "VS Code Opened",
    description: "Development activity detected",
    icon: Code2,
    iconStyle: "bg-blue-500/10 text-blue-400",
  },
  {
    time: "10:15 AM",
    title: "Chrome Active",
    description: "Browser activity detected",
    icon: Globe,
    iconStyle: "bg-purple-500/10 text-purple-400",
  },
  {
    time: "11:20 AM",
    title: "Break Started",
    description: "User activity paused",
    icon: Coffee,
    iconStyle: "bg-amber-500/10 text-amber-400",
  },
  {
    time: "11:35 AM",
    title: "Work Resumed",
    description: "Digital activity detected",
    icon: Play,
    iconStyle: "bg-emerald-500/10 text-emerald-400",
  },
  {
    time: "01:10 PM",
    title: "Fatigue Increased",
    description: "AI detected increased fatigue",
    icon: BrainCircuit,
    iconStyle: "bg-orange-500/10 text-orange-400",
  },
];

const ActivityFeed = () => {
  return (
    <div className="space-y-5">

      {activities.map((activity, index) => {
        const Icon = activity.icon;

        return (
          <div
            key={activity.time}
            className="relative flex gap-4"
          >

            {/* Timeline Line */}

            {index !== activities.length - 1 && (
              <div className="absolute left-5 top-11 h-[calc(100%+8px)] w-px bg-slate-800" />
            )}

            {/* Activity Icon */}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconStyle}`}
            >
              <Icon size={18} />
            </div>

            {/* Activity Information */}

            <div className="min-w-0 flex-1">

              <div className="flex items-start justify-between gap-3">

                <h3 className="text-sm font-semibold text-white">
                  {activity.title}
                </h3>

                <span className="shrink-0 text-xs text-slate-500">
                  {activity.time}
                </span>

              </div>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {activity.description}
              </p>

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default ActivityFeed;
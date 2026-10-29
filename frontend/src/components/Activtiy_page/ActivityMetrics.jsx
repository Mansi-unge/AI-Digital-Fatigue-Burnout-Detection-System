import React from "react";

const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
};

const ActivityMetrics = ({
  metrics,
  latest,
  activityLive,
}) => {
  const cards = [
    {
      title: "Screen Time",
      value: formatDuration(metrics.screenTimeSeconds),
      description: "Latest captured interval",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      ),
      iconClass: "bg-blue-50 text-blue-600",
      valueClass: "text-blue-700",
    },

    {
      title: "Active Time",
      value: formatDuration(metrics.activeTimeSeconds),
      description: "Latest active interval",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-700",
    },

    {
      title: "Keyboard",
      value: metrics.keyboardCount.toLocaleString(),
      description: "Latest captured presses",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01" />
          <path d="M7 14h10" />
        </svg>
      ),
      iconClass: "bg-violet-50 text-violet-600",
      valueClass: "text-violet-700",
    },

    {
      title: "Mouse Clicks",
      value: metrics.mouseClicks.toLocaleString(),
      description: "Latest captured clicks",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <path d="M12 3a6 6 0 0 0-6 6v6a6 6 0 0 0 12 0V9a6 6 0 0 0-6-6Z" />
          <path d="M12 3v7" />
        </svg>
      ),
      iconClass: "bg-orange-50 text-orange-600",
      valueClass: "text-orange-700",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconClass}`}
            >
              {card.icon}
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                activityLive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {activityLive ? "Live" : "Captured"}
            </span>

          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {card.title}
            </p>

            <p
              className={`mt-1 truncate text-3xl font-bold tracking-tight ${card.valueClass}`}
            >
              {card.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {card.description}
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 h-34 w-34 rounded-full bg-slate-50 transition group-hover:scale-125" />
        </div>
      ))}
    </section>
  );
};

export default ActivityMetrics;
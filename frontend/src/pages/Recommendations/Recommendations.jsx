import React, { useMemo, useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Eye,
  Monitor,
  HeartPulse,
  Thermometer,
  Coffee,
  Check,
  Info,
} from "lucide-react";

/* -------------------------------------------------------
   Category configuration
------------------------------------------------------- */

const categories = [
  { key: "all", label: "All" },
  { key: "fatigue", label: "Fatigue" },
  { key: "health", label: "Health" },
  { key: "screen_time", label: "Screen Time" },
  { key: "environment", label: "Environment" },
];

/* -------------------------------------------------------
   Recommendation icon helper
------------------------------------------------------- */

const getRecommendationIcon = (type) => {
  switch (type) {
    case "fatigue":
      return AlertTriangle;

    case "health":
      return HeartPulse;

    case "screen_time":
      return Monitor;

    case "environment":
      return Thermometer;

    case "eye":
      return Eye;

    case "break":
      return Coffee;

    default:
      return Lightbulb;
  }
};

/* -------------------------------------------------------
   Recommendation Card
------------------------------------------------------- */

const RecommendationCard = ({
  type,
  priority = "medium",
  title,
  message,
  recommendation,
  completed,
  onComplete,
}) => {
  const Icon = getRecommendationIcon(type);

  const priorityStyles = {
    high: {
      badge: "bg-red-50 text-red-600",
      icon: "bg-red-50 text-red-600",
    },

    medium: {
      badge: "bg-amber-50 text-amber-600",
      icon: "bg-amber-50 text-amber-600",
    },

    low: {
      badge: "bg-blue-50 text-blue-600",
      icon: "bg-blue-50 text-blue-600",
    },
  };

  const style = priorityStyles[priority] || priorityStyles.medium;

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 ${
        completed
          ? "border-slate-200 opacity-70"
          : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
            >
              {priority}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {message}
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Recommendation
            </p>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              {recommendation}
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onComplete}
              disabled={completed}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                completed
                  ? "cursor-default bg-emerald-50 text-emerald-600"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <Check className="h-3.5 w-3.5" />

              {completed ? "Completed" : "Mark as completed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Main page
------------------------------------------------------- */

const Recommendations = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  /*
   * IMPORTANT:
   * This is intentionally empty.
   *
   * Later this will come from:
   * GET /recommendations/current
   */
  const recommendations = [];

  const filteredRecommendations = useMemo(() => {
    if (activeCategory === "all") {
      return recommendations;
    }

    return recommendations.filter(
      (item) => item.type === activeCategory
    );
  }, [activeCategory, recommendations]);

  return (
    <div className="min-h-full bg-[#f5f7fb] p-5 lg:p-7">
      <div className="mx-auto max-w-[1200px]">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Recommendations
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Personalized actions based on your monitoring data
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            INFO
        ================================================= */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Recommendations will appear during monitoring
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              Recommendations are generated from your monitoring and prediction
              data. Start AI Monitoring to begin receiving personalized
              suggestions.
            </p>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = activeCategory === category.key;

            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}
        {filteredRecommendations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <Lightbulb className="h-6 w-6 text-slate-400" />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-800">
                No recommendations yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Recommendations will appear here when sufficient monitoring
                data is available and the recommendation service identifies
                something that requires your attention.
              </p>

            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                {...recommendation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
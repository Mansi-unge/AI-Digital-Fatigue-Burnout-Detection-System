
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Lightbulb,
  AlertTriangle,
  Monitor,
  HeartPulse,
  Coffee,
  CheckCircle2,
  Info,
  RefreshCw,
  BrainCircuit,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { getCurrentRecommendations } from "../../api/recommendationApi";

// ==========================================================
// CATEGORY FILTERS
// ==========================================================

const categories = [
  { key: "all", label: "All" },
  { key: "fatigue", label: "Fatigue" },
  { key: "burnout", label: "Burnout" },
  { key: "health", label: "Health" },
  { key: "screen_time", label: "Screen Time" },
  { key: "break", label: "Breaks" },
  { key: "other", label: "Other" },
];

// ==========================================================
// NORMALIZE RECOMMENDATION TYPE
// ==========================================================

const normalizeType = (type = "") => {
  const value = String(type).toLowerCase().trim();

  if (value.includes("fatigue")) return "fatigue";
  if (value.includes("burnout")) return "burnout";
  if (value.includes("health")) return "health";
  if (value.includes("screen")) return "screen_time";
  if (value.includes("break")) return "break";

  return "other";
};

// ==========================================================
// RECOMMENDATION ICON
// ==========================================================

const getRecommendationIcon = (type) => {
  switch (normalizeType(type)) {
    case "fatigue":
      return AlertTriangle;

    case "burnout":
      return BrainCircuit;

    case "health":
      return HeartPulse;

    case "screen_time":
      return Monitor;

    case "break":
      return Coffee;

    default:
      return Lightbulb;
  }
};

// ==========================================================
// PRIORITY STYLES
// ==========================================================

const getPriorityStyles = (priority = "Medium") => {
  switch (String(priority).toLowerCase()) {
    case "high":
      return {
        badge: "bg-red-50 text-red-600",
        icon: "bg-red-50 text-red-600",
      };

    case "low":
      return {
        badge: "bg-blue-50 text-blue-600",
        icon: "bg-blue-50 text-blue-600",
      };

    default:
      return {
        badge: "bg-amber-50 text-amber-600",
        icon: "bg-amber-50 text-amber-600",
      };
  }
};

// ==========================================================
// FORMAT TIMESTAMP
// ==========================================================

const formatTimestamp = (value) => {
  if (!value) {
    return "Timestamp unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Timestamp unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================================
// NORMALIZE API RECOMMENDATION
// ==========================================================

const normalizeRecommendation = (item) => ({
  ...item,
  type: item.type || item.category || "General",
  message: item.message || item.description || "",
  title:
    item.title ||
    `${item.type || item.category || "General"} Recommendation`,
  priority: item.priority || "Medium",
});

// ==========================================================
// RECOMMENDATION CARD
// ==========================================================

const RecommendationCard = ({ item }) => {
  const Icon = getRecommendationIcon(item.type);
  const styles = getPriorityStyles(item.priority);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {item.title}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
            >
              {item.priority} Priority
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {item.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Generated from your monitoring data</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTimestamp(item.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// SUMMARY CARD
// ==========================================================

const SummaryCard = ({
  title,
  count,
  description,
  icon: Icon,
  color,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {count}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

// ==========================================================
// MAIN RECOMMENDATIONS PAGE
// ==========================================================

const Recommendations = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const [recommendations, setRecommendations] = useState([]);

  const [sessionId, setSessionId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);

  // ========================================================
  // GET LOGGED-IN USER
  // ========================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      const parsedUser = storedUser
        ? JSON.parse(storedUser)
        : null;

      setUserId(
        parsedUser?.id ??
          parsedUser?.user_id ??
          localStorage.getItem("user_id") ??
          null
      );
    } catch (err) {
      console.error(
        "Unable to read logged-in user:",
        err
      );

      setUserId(
        localStorage.getItem("user_id") || null
      );
    }
  }, []);

  // ========================================================
  // LOAD RECOMMENDATIONS
  // ========================================================

  const loadRecommendations = useCallback(
    async (showLoader = false) => {
      if (!userId) {
        setLoading(false);
        setError(
          "Unable to identify your account. Please log in again."
        );
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const response =
          await getCurrentRecommendations(userId);

        const result = response.data || {};

        const receivedRecommendations = Array.isArray(
          result.recommendations
        )
          ? result.recommendations.map(
              normalizeRecommendation
            )
          : [];

        setRecommendations(receivedRecommendations);

        setSessionId(result.session_id ?? null);
      } catch (err) {
        console.error(
          "Recommendations loading error:",
          err
        );

        // Preserve previously loaded recommendations
        // when a background refresh fails.
        setError(
          err.response?.data?.message ||
            "Unable to load recommendations. Please try again."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [userId]
  );

  // ========================================================
  // INITIAL LOAD + AUTOMATIC REFRESH
  // ========================================================

  useEffect(() => {
    if (!userId) return;

    loadRecommendations(true);

    const interval = setInterval(() => {
      loadRecommendations(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [userId, loadRecommendations]);

  // ========================================================
  // FILTER RECOMMENDATIONS
  // ========================================================

  const filteredRecommendations = useMemo(() => {
    if (activeCategory === "all") {
      return recommendations;
    }

    return recommendations.filter(
      (item) =>
        normalizeType(item.type) === activeCategory
    );
  }, [activeCategory, recommendations]);

  // ========================================================
  // PRIORITY COUNTS
  // ========================================================

  const priorityCounts = useMemo(() => {
    return {
      total: recommendations.length,

      high: recommendations.filter(
        (item) =>
          item.priority?.toLowerCase() === "high"
      ).length,

      medium: recommendations.filter(
        (item) =>
          item.priority?.toLowerCase() === "medium"
      ).length,

      low: recommendations.filter(
        (item) =>
          item.priority?.toLowerCase() === "low"
      ).length,
    };
  }, [recommendations]);

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div className="min-h-full bg-[#f5f7fb] p-5 lg:p-7">
      <div className="mx-auto max-w-[1200px]">

        {/* HEADER */}

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

          <button
            type="button"
            onClick={() => loadRecommendations(true)}
            disabled={loading || !userId}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load recommendations
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* INFORMATION */}

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Personalized monitoring suggestions
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              Recommendations are automatically updated
              while AI Monitoring is running. Each saved
              recommendation remains available for 23 hours.
            </p>

            {sessionId && (
              <p className="mt-2 text-xs font-medium text-amber-800">
                Current monitoring session: #{sessionId}
              </p>
            )}
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Recommendations"
            count={priorityCounts.total}
            description="Generated suggestions"
            icon={Lightbulb}
            color="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="High Priority"
            count={priorityCounts.high}
            description="Requires attention"
            icon={AlertTriangle}
            color="bg-red-50 text-red-600"
          />

          <SummaryCard
            title="Medium Priority"
            count={priorityCounts.medium}
            description="Needs consideration"
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Low Priority"
            count={priorityCounts.low}
            description="Maintain healthy habits"
            icon={CheckCircle2}
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* CATEGORY FILTERS */}

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const active =
              activeCategory === category.key;

            return (
              <button
                key={category.key}
                type="button"
                onClick={() =>
                  setActiveCategory(category.key)
                }
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category.label}

                {category.key === "all" && (
                  <span className="ml-2 opacity-70">
                    {recommendations.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RECOMMENDATION LIST */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading recommendations...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Fetching your latest monitoring suggestions
              </p>
            </div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <Lightbulb className="h-6 w-6 text-slate-400" />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-800">
                {recommendations.length === 0
                  ? "No recommendations yet"
                  : "No recommendations in this category"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {recommendations.length === 0
                  ? "Recommendations will appear when AI Monitoring generates and saves suggestions from your activity data."
                  : "Try selecting another category to view your available recommendations."}
              </p>

              {recommendations.length === 0 && !error && (
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">
                  <Info className="h-4 w-4" />
                  Start AI Monitoring to receive personalized suggestions.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map(
              (item, index) => (
                <RecommendationCard
                  key={
                    item.id ??
                    `${item.type}-${index}`
                  }
                  item={item}
                />
              )
            )}
          </div>
        )}

        {/* FOOTER */}

        {!loading && recommendations.length > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />

            <span>
              {recommendations.length} recommendation(s)
              currently available. Recommendations expire
              23 hours after creation.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#A855F7",
  "#EF4444",
];

const INTERVAL_SECONDS = 10;

/* ==========================================================
   NORMALIZE WINDOW TITLE → APPLICATION NAME
   ========================================================== */

const normalizeApplicationName = (title) => {
  if (!title || typeof title !== "string") {
    return null;
  }

  const value = title.trim();

  if (!value || value.toLowerCase() === "unknown") {
    return null;
  }

  const lower = value.toLowerCase();

  // -----------------------------
  // DEVELOPMENT
  // -----------------------------

  if (
    lower.includes("visual studio code") ||
    lower.includes(" - code")
  ) {
    return "VS Code";
  }

  if (lower.includes("visual studio")) {
    return "Visual Studio";
  }

  // -----------------------------
  // BROWSERS
  // -----------------------------

  if (lower.includes("google chrome")) {
    return "Google Chrome";
  }

  if (lower.includes("microsoft edge")) {
    return "Microsoft Edge";
  }

  if (
    lower.includes("mozilla firefox") ||
    lower.includes("firefox")
  ) {
    return "Firefox";
  }

  // -----------------------------
  // MICROSOFT OFFICE
  // -----------------------------

  if (lower.includes("microsoft word")) {
    return "Microsoft Word";
  }

  if (
    lower.includes("microsoft excel") ||
    lower.includes("excel")
  ) {
    return "Microsoft Excel";
  }

  if (
    lower.includes("microsoft powerpoint") ||
    lower.includes("powerpoint")
  ) {
    return "Microsoft PowerPoint";
  }

  if (lower.includes("microsoft teams")) {
    return "Microsoft Teams";
  }

  // -----------------------------
  // CHAT / COMMUNICATION
  // -----------------------------

  if (lower.includes("chatgpt")) {
    return "ChatGPT";
  }

  if (lower.includes("discord")) {
    return "Discord";
  }

  if (lower.includes("slack")) {
    return "Slack";
  }

  if (lower.includes("zoom")) {
    return "Zoom";
  }

  // -----------------------------
  // MEDIA
  // -----------------------------

  if (lower.includes("spotify")) {
    return "Spotify";
  }

  // -----------------------------
  // FALLBACK
  // -----------------------------

  /*
    If the application isn't one of the
    known applications above, remove
    common window-title suffixes.

    Example:
    "my-project - My App"
      → "my-project"
  */

  const parts = value
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    return parts[parts.length - 1];
  }

  return value;
};

const ApplicationPieChart = ({ records = [] }) => {

  /* ==========================================================
     CALCULATE APPLICATION USAGE
     ========================================================== */

  const applicationData = useMemo(() => {

    if (
      !Array.isArray(records) ||
      records.length === 0
    ) {
      return [];
    }

    const usage = {};

    records.forEach((record) => {

      const application =
        normalizeApplicationName(
          record?.active_application
        );

      if (!application) {
        return;
      }

      usage[application] =
        (usage[application] || 0) +
        INTERVAL_SECONDS;
    });

    const entries = Object.entries(usage);

    if (entries.length === 0) {
      return [];
    }

    // Sort by usage time
    entries.sort(
      (a, b) => b[1] - a[1]
    );

    // Top 4 applications
    const topApplications =
      entries.slice(0, 4);

    // Everything else
    const remainingApplications =
      entries.slice(4);

    const topTotal =
      topApplications.reduce(
        (sum, [, seconds]) =>
          sum + seconds,
        0
      );

    const othersTotal =
      remainingApplications.reduce(
        (sum, [, seconds]) =>
          sum + seconds,
        0
      );

    const result =
      topApplications.map(
        ([name, seconds]) => ({
          name,
          value: seconds,
          seconds,
        })
      );

    if (othersTotal > 0) {
      result.push({
        name: "Others",
        value: othersTotal,
        seconds: othersTotal,
      });
    }

    const totalSeconds =
      topTotal + othersTotal;

    return result.map((item) => ({
      ...item,

      percentage:
        totalSeconds > 0
          ? Math.round(
              (item.seconds /
                totalSeconds) *
                100
            )
          : 0,
    }));

  }, [records]);

  /* ==========================================================
     MOST USED APPLICATION
     ========================================================== */

  const mostUsedApplication =
    applicationData[0];

  /* ==========================================================
     FORMAT TIME
     ========================================================== */

  const formatTime = (seconds) => {

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div
      className="
        bg-white
        rounded-lg
        border border-slate-200
        p-6
        h-full
        shadow-sm
        hover:shadow-md
        transition
      "
    >

      {/* ======================================================
          HEADING
      ====================================================== */}

      <h2 className="text-xl font-bold text-slate-800">
        Application Usage
      </h2>

      <p className="text-sm text-slate-500 mt-1">
        Time spent on active applications
      </p>

      {/* ======================================================
          PIE CHART
      ====================================================== */}

      <div className="w-full h-[260px]">

        {applicationData.length > 0 ? (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={applicationData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
              >

                {applicationData.map(
                  (entry, index) => (

                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              {/* ==================================================
                  TOOLTIP
              ================================================== */}

              <Tooltip
                formatter={(
                  value,
                  name,
                  props
                ) => [
                  formatTime(
                    props.payload.seconds
                  ),
                  name,
                ]}
              />

              {/* ==================================================
                  LEGEND
              ================================================== */}

              <Legend
                formatter={(
                  value,
                  entry
                ) => (
                  <span className="text-sm">
                    {value} (
                    {entry.payload?.percentage ?? 0}
                    %)
                  </span>
                )}
              />

            </PieChart>

          </ResponsiveContainer>

        ) : (

          <div className="h-full flex items-center justify-center">

            <p className="text-sm text-slate-400">
              No application usage data yet
            </p>

          </div>

        )}

      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="border-t border-slate-200 pt-2">

        <p className="text-sm text-slate-500">
          Most used application today:
        </p>

        <h3 className="text-lg font-semibold text-blue-600 ">

          {mostUsedApplication
            ? `${mostUsedApplication.name} (${mostUsedApplication.percentage}%)`
            : "No data yet"}

        </h3>

      </div>

    </div>
  );
};

export default ApplicationPieChart;
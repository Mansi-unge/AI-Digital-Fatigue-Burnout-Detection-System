
import React, { useEffect, useState } from "react";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Circle,
  Eye,
  HeartPulse,
  Info,
  Keyboard,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  getCurrentPrediction,
  getPredictionHistory,
} from "../../api/monitoringApi";

// ============================================================
// USER
// ============================================================

const getUserId = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null")?.id ??
      localStorage.getItem("user_id") ??
      null
    );
  } catch {
    return localStorage.getItem("user_id") || null;
  }
};

// ============================================================
// FORMATTING
// ============================================================

const formatTime = (seconds) => {
  const value = Number(seconds || 0);

  if (value >= 3600) {
    return `${(value / 3600).toFixed(1)} hours`;
  }

  return `${Math.round(value / 60)} min`;
};

const formatValue = (value, suffix = "") =>
  value === null || value === undefined
    ? "Waiting for data"
    : `${value}${suffix}`;

// ============================================================
// SCORE CARD
// ============================================================

const ScoreCard = ({
  icon: Icon,
  title,
  value,
  status,
  description,
  iconBg,
  iconColor,
  statusColor,
  accentColor,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
    <div
      className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] opacity-60 ${iconBg}`}
    />

    <div className="relative flex items-center justify-between">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Score
      </span>
    </div>

    <div className="relative mt-5">
      <p className="text-sm font-semibold text-slate-500">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-2">
        <span
          className="text-3xl font-bold tracking-tight text-slate-900"
        >
          {value ?? "—"}
        </span>

        {value !== null && value !== undefined && (
          <span className="text-xs font-medium text-slate-400">
            /100
          </span>
        )}
      </div>

      <div className="mt-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}
        >
          <Circle className="h-1.5 w-1.5 fill-current" />
          {status || "Waiting for data"}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  </div>
);

// ============================================================
// AREA TREND CHART
// ============================================================

const TrendCard = ({
  title,
  description,
  icon: Icon,
  data,
  dataKey,
  color,
  gradientId,
  iconBg,
  iconColor,
  historyLoading,
}) => {
  const latestValue =
    data.length > 0 ? data[data.length - 1][dataKey] : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div
        className={`absolute right-0 top-0 h-20 w-20 rounded-bl-[70px] opacity-50 ${iconBg}`}
      />

      {/* Heading */}

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {title}
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <TrendingUp
          className="mt-1 h-4 w-4 shrink-0"
          style={{ color }}
        />
      </div>

      {/* Latest Score */}

      <div className="relative mt-5 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Latest Score
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ color }}
            >
              {latestValue !== null && latestValue !== undefined
                ? latestValue
                : "—"}
            </span>

            {latestValue !== null && latestValue !== undefined && (
              <span className="text-xs text-slate-400">/100</span>
            )}
          </div>
        </div>

        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          {data.length} records
        </span>
      </div>

      {/* Chart */}

      <div className="mt-4 h-[180px] w-full">
        {historyLoading && data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <p className="mt-2 text-xs text-slate-400">
              Loading trend...
            </p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 8,
                right: 5,
                left: -28,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={color}
                    stopOpacity={0.30}
                  />
                  <stop
                    offset="95%"
                    stopColor={color}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                axisLine={false}
                tickLine={false}
                minTickGap={25}
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{
                  fontSize: 9,
                  fill: "#94a3b8",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(value) => [`${value}/100`, title]}
                labelFormatter={(label) => `Time: ${label}`}
              />

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                activeDot={{
                  r: 5,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-400">
              No historical data available
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[10px] font-medium text-slate-400">
          Historical monitoring data
        </span>

        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ============================================================
// FACTOR ROW
// ============================================================

const FactorRow = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 py-3 last:border-0">
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>

      <span className="truncate text-xs font-medium text-slate-700 sm:text-sm">
        {label}
      </span>
    </div>

    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-right text-[11px] font-semibold text-slate-600">
      {value ?? "Waiting for data"}
    </span>
  </div>
);

// ============================================================
// SUMMARY ITEM
// ============================================================

const SummaryItem = ({ icon: Icon, label, value, iconColor }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${iconColor}`} />

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>

    <p className="mt-2 break-words text-sm font-bold text-slate-800">
      {value}
    </p>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const Prediction = () => {
  const userId = getUserId();

  const [predictionData, setPredictionData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // ----------------------------------------------------------
  // FETCH PREDICTION AND HISTORY
  // ----------------------------------------------------------

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setHistoryLoading(false);
      setError("Please log in to view your prediction.");
      return;
    }

    let mounted = true;

    const fetchPrediction = async () => {
      try {
        const response = await getCurrentPrediction(userId);
        const result = response.data;

        if (!mounted) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Unable to retrieve prediction."
          );
        }

        setPredictionData(result);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (!mounted) return;

        console.error(
          "Prediction API error:",
          err?.response?.data || err.message
        );

        setError(
          err?.response?.data?.message ||
            err.message ||
            "Unable to connect to the prediction service."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchPredictionHistory = async () => {
      try {
        const response = await getPredictionHistory(userId);
        const result = response.data;

        if (!mounted) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Unable to retrieve prediction history."
          );
        }

        const formattedData = (result.data || [])
          .filter((item) => item.timestamp)
          .map((item) => ({
            activityId: item.activity_id,
            timestamp: item.timestamp,

            time: new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),

            fatigue: Number(item.fatigue?.score ?? 0),
            burnout: Number(item.burnout?.score ?? 0),
            health: Number(item.health?.score ?? 0),
          }));

        setHistoryData(formattedData);
        setHistoryError("");
      } catch (err) {
        if (!mounted) return;

        console.error(
          "Prediction history API error:",
          err?.response?.data || err.message
        );

        setHistoryError(
          "Unable to load historical prediction data."
        );
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };

    fetchPrediction();
    fetchPredictionHistory();

    const interval = setInterval(() => {
      fetchPrediction();
      fetchPredictionHistory();
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  // ----------------------------------------------------------
  // DERIVED VALUES
  // ----------------------------------------------------------

  const hasPrediction =
    predictionData?.has_prediction === true;

  const prediction = predictionData?.prediction || {};
  const features = predictionData?.features || {};

  const monitoringStatus = loading
    ? "Loading prediction..."
    : hasPrediction
      ? "AI Monitoring Active"
      : "Waiting for monitoring data";

  const statusColor = hasPrediction
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";

  // ----------------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------------

  return (
    <div className="min-h-full bg-[#f5f7fb] p-5 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* ==================================================
            1. HEADER
        ================================================== */}

        <header className="mb-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200">
                <BrainCircuit className="h-7 w-7 text-white" />

                <span
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-[#f5f7fb] ${
                    hasPrediction
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Fatigue Prediction
                  </h1>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusColor}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hasPrediction
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />

                    {monitoringStatus}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  AI-powered fatigue, burnout and health analytics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />

                <span className="text-xs font-medium text-slate-500">
                  Auto refresh
                </span>

                <span className="text-xs font-bold text-slate-700">
                  8s
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                <RefreshCw className="h-4 w-4 text-blue-600" />

                <span className="text-xs font-semibold text-slate-600">
                  Live analysis
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <p className="text-sm font-bold text-red-800">
                Prediction service issue
              </p>

              <p className="mt-0.5 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            2. CURRENT ASSESSMENT
        ================================================== */}

        <section className="mb-7">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Current Assessment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Overview of your latest monitoring-based scores.
              </p>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-4 w-4" />
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

            <ScoreCard
              icon={Activity}
              title="Fatigue Score"
              value={hasPrediction ? prediction.fatigue?.score : null}
              status={hasPrediction ? prediction.fatigue?.level : "Waiting for data"}
              description="Current estimated digital fatigue level."
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              statusColor="border-violet-100 bg-violet-50 text-violet-700"
            />

            <ScoreCard
              icon={AlertTriangle}
              title="Burnout Risk"
              value={hasPrediction ? prediction.burnout?.score : null}
              status={hasPrediction ? prediction.burnout?.level : "Waiting for data"}
              description="Estimated burnout risk based on monitoring patterns."
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              statusColor="border-amber-100 bg-amber-50 text-amber-700"
            />

            <ScoreCard
              icon={HeartPulse}
              title="Health Score"
              value={hasPrediction ? prediction.health?.score : null}
              status={hasPrediction ? prediction.health?.level : "Waiting for data"}
              description="Overall monitoring-based health indicator."
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              statusColor="border-emerald-100 bg-emerald-50 text-emerald-700"
            />

          </div>
        </section>

        {/* ==================================================
            3. PREDICTION TRENDS
        ================================================== */}

        <section className="mb-7">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Prediction Trends
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Historical changes in fatigue, burnout risk and health.
              </p>
            </div>

            {historyData.length > 0 && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {historyData.length} historical records
              </span>
            )}
          </div>

          {historyError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {historyError}
            </div>
          )}

          {historyLoading && historyData.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-500" />

              <p className="mt-4 text-sm font-semibold text-slate-600">
                Loading prediction history
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Retrieving historical monitoring records...
              </p>
            </div>
          ) : historyData.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <TrendingUp className="h-7 w-7 text-blue-500" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                No Historical Data Yet
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Start AI Monitoring to collect activity records and generate your historical prediction trends.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

              <TrendCard
                title="Fatigue Trend"
                description="Digital fatigue level"
                icon={Activity}
                data={historyData}
                dataKey="fatigue"
                color="#8b5cf6"
                gradientId="fatigueGradient"
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                historyLoading={historyLoading}
              />

              <TrendCard
                title="Burnout Risk"
                description="Estimated burnout risk"
                icon={AlertTriangle}
                data={historyData}
                dataKey="burnout"
                color="#f59e0b"
                gradientId="burnoutGradient"
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                historyLoading={historyLoading}
              />

              <TrendCard
                title="Health Trend"
                description="Monitoring-based health"
                icon={HeartPulse}
                data={historyData}
                dataKey="health"
                color="#10b981"
                gradientId="healthGradient"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                historyLoading={historyLoading}
              />

            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Info className="h-4 w-4 shrink-0 text-blue-500" />
            Trends are plotted from actual historical monitoring records.
          </div>
        </section>

        {/* ==================================================
            4. MONITORING INSIGHTS
        ================================================== */}

        <section className="mb-7">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Monitoring Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View the signals behind your assessment and prediction details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* CONTRIBUTING FACTORS */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <Activity className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Contributing Factors
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Signals used in the fatigue assessment
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-6 px-5 py-2 sm:grid-cols-2 sm:px-6">
                <div>
                  <FactorRow
                    icon={Clock}
                    label="Screen Time"
                    value={hasPrediction ? formatTime(features.screen_time) : undefined}
                  />

                  <FactorRow
                    icon={Clock}
                    label="Idle Time"
                    value={hasPrediction ? formatTime(features.idle_time) : undefined}
                  />

                  <FactorRow
                    icon={Eye}
                    label="Eye Closure"
                    value={hasPrediction ? formatValue(features.eye_closure, "%") : undefined}
                  />

                  <FactorRow
                    icon={Eye}
                    label="Blink Rate"
                    value={hasPrediction ? formatValue(features.blink_rate, " /min") : undefined}
                  />
                </div>

                <div>
                  <FactorRow
                    icon={Activity}
                    label="Yawn Count"
                    value={hasPrediction ? formatValue(features.yawn_count) : undefined}
                  />

                  <FactorRow
                    icon={Keyboard}
                    label="Keyboard Activity"
                    value={hasPrediction ? formatValue(features.keyboard_count) : undefined}
                  />

                  <FactorRow
                    icon={MousePointer2}
                    label="Mouse Activity"
                    value={hasPrediction ? formatValue(features.mouse_clicks) : undefined}
                  />

                  <FactorRow
                    icon={Thermometer}
                    label="Environment"
                    value={
                      hasPrediction
                        ? `${Number(features.temperature || 0).toFixed(1)}°C · ${Number(features.humidity || 0).toFixed(1)}%`
                        : undefined
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />

                <p className="text-xs text-slate-500">
                  Monitoring signals support the prediction calculation.
                </p>
              </div>
            </div>

            {/* PREDICTION SUMMARY */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    <BrainCircuit className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Prediction Summary
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Current AI monitoring assessment information
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
                <SummaryItem
                  icon={Activity}
                  label="Prediction Status"
                  value={
                    hasPrediction
                      ? "Assessment Available"
                      : "Waiting for Data"
                  }
                  iconColor="text-blue-600"
                />

                <SummaryItem
                  icon={CheckCircle2}
                  label="Records Used"
                  value={
                    hasPrediction
                      ? predictionData.records_used ?? 0
                      : 0
                  }
                  iconColor="text-emerald-600"
                />

                <SummaryItem
                  icon={Clock}
                  label="Last Updated"
                  value={
                    lastUpdated
                      ? lastUpdated.toLocaleTimeString()
                      : "Not available"
                  }
                  iconColor="text-indigo-600"
                />

                <SummaryItem
                  icon={TrendingUp}
                  label="History Records"
                  value={historyData.length}
                  iconColor="text-violet-600"
                />
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Monitoring and prediction information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {hasPrediction
                      ? `The current assessment was generated using ${predictionData.records_used ?? 0} monitoring records. Prediction and historical data refresh automatically every 8 seconds.`
                      : predictionData?.message ||
                        "Prediction information will become available after sufficient AI Monitoring data has been collected."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            FOOTER INFORMATION
        ================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />

            <p className="text-xs font-medium text-slate-500">
              VitaSense AI Digital Fatigue Monitoring
            </p>
          </div>

          <p className="text-xs text-slate-400">
            {lastUpdated
              ? `Last synchronized: ${lastUpdated.toLocaleTimeString()}`
              : "Waiting for monitoring data"}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Prediction;

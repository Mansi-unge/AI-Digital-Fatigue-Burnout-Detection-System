import React, { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const normalizeTimestamp = (record) => {
  const raw =
    record?.created_at ||
    record?.timestamp ||
    record?.recorded_at ||
    record?.updated_at;

  if (!raw) return null;

  let value = String(raw);

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

const formatSeconds = (seconds) => {
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

const ActivityChart = ({ records = [] }) => {
  const [selectedMetric, setSelectedMetric] =
    useState("active");

  const chartData = useMemo(() => {
    return [...records]
      .reverse()
      .slice(-30)
      .map((record, index) => {
        const date = normalizeTimestamp(record);

        return {
          index,
          time: date
            ? date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : `#${index + 1}`,

          active: Number(record?.active_time) || 0,
          idle: Number(record?.idle_time) || 0,
          keyboard: Number(record?.keyboard_count) || 0,
          mouse: Number(record?.mouse_clicks) || 0,
        };
      });
  }, [records]);

  const config = {
    active: {
      label: "Active Time",
      color: "#2563eb",
      dataKey: "active",
      formatter: (value) => formatSeconds(value),
    },

    idle: {
      label: "Idle Time",
      color: "#f59e0b",
      dataKey: "idle",
      formatter: (value) => formatSeconds(value),
    },

    keyboard: {
      label: "Keyboard Activity",
      color: "#7c3aed",
      dataKey: "keyboard",
      formatter: (value) => `${value} presses`,
    },

    mouse: {
      label: "Mouse Activity",
      color: "#ea580c",
      dataKey: "mouse",
      formatter: (value) => `${value} clicks`,
    },
  };

  const current = config[selectedMetric];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}

      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-2">

            <h2 className="text-lg font-bold text-slate-900">
              Activity Trends
            </h2>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
              Last 30 records
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Behavioural activity captured during monitoring.
          </p>
        </div>

        {/* FILTER */}

        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">

          {Object.entries(config).map(
            ([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  selectedMetric === key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label.replace(" Activity", "")}
              </button>
            )
          )}

        </div>

      </div>

      {/* CHART */}

      <div className="p-4 sm:p-6">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current metric
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {current.label}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: current.color,
              }}
            />

            <span className="text-xs font-medium text-slate-500">
              Activity data
            </span>
          </div>

        </div>

        <div className="h-[310px] w-full">

          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M7 15l3-4 3 2 5-7" />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No activity data yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Start monitoring to populate the chart.
                </p>

              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >

                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={current.color}
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopColor={current.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="time"
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 30px rgba(15,23,42,0.08)",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                  formatter={(value) =>
                    current.formatter(value)
                  }
                />

                <Area
                  type="monotone"
                  dataKey={current.dataKey}
                  stroke={current.color}
                  strokeWidth={2.5}
                  fill="url(#activityGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />

              </AreaChart>
            </ResponsiveContainer>
          )}

        </div>

      </div>
    </section>
  );
};

export default ActivityChart;
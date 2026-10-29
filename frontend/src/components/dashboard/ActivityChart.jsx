import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ActivityChart = ({ records = [] }) => {
  const data = useMemo(() => {
    // ==========================================================
    // 1. CREATE LAST 7 CALENDAR DAYS
    // ==========================================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSevenDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);

      date.setDate(
        today.getDate() - i
      );

      const dateKey =
        `${date.getFullYear()}-` +
        `${String(date.getMonth() + 1).padStart(2, "0")}-` +
        `${String(date.getDate()).padStart(2, "0")}`;

      lastSevenDays.push({
        dateKey,
        timestamp: date.getTime(),

        time: date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),

        fullDate: date.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        screen: 0,
        active: 0,
        idle: 0,
      });
    }

    // ==========================================================
    // 2. NO RECORDS
    // Still return all 7 days
    // ==========================================================

    if (!records || records.length === 0) {
      return lastSevenDays;
    }

    // ==========================================================
    // 3. GROUP HISTORICAL RECORDS BY DATE
    // ==========================================================

    records.forEach((record) => {
      const timestamp =
        record?.timestamp ||
        record?.created_at ||
        record?.recorded_at;

      if (!timestamp) {
        return;
      }

      const date = new Date(timestamp);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const recordDate = new Date(date);

      recordDate.setHours(
        0,
        0,
        0,
        0
      );

      const dateKey =
        `${recordDate.getFullYear()}-` +
        `${String(recordDate.getMonth() + 1).padStart(2, "0")}-` +
        `${String(recordDate.getDate()).padStart(2, "0")}`;

      const day = lastSevenDays.find(
        (item) =>
          item.dateKey === dateKey
      );

      if (!day) {
        return;
      }

      // ========================================================
      // IMPORTANT
      //
      // screen_time, active_time and idle_time are cumulative
      // values.
      //
      // Therefore we keep the MAXIMUM value recorded for that
      // day instead of adding every record together.
      // ========================================================

      day.screen = Math.max(
        day.screen,
        Number(record?.screen_time) || 0
      );

      day.active = Math.max(
        day.active,
        Number(record?.active_time) || 0
      );

      day.idle = Math.max(
        day.idle,
        Number(record?.idle_time) || 0
      );
    });

    // ==========================================================
    // 4. CONVERT SECONDS → MINUTES
    // ==========================================================

    return lastSevenDays.map((day) => ({
      ...day,

      screen: Number(
        (day.screen / 60).toFixed(1)
      ),

      active: Number(
        (day.active / 60).toFixed(1)
      ),

      idle: Number(
        (day.idle / 60).toFixed(1)
      ),
    }));
  }, [records]);

  // ==========================================================
  // 5. X-AXIS
  // ==========================================================

  return (
    <div
      className="
        bg-white
        rounded-lg
        border border-slate-200
        p-6
        h-[460px]
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Desktop Activity
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Last 7 days
          </p>
        </div>
      </div>

      {/* EMPTY / CHART */}
      <ResponsiveContainer
        width="100%"
        height="78%"
      >
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
            axisLine={{
              stroke: "#cbd5e1",
            }}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Minutes",
              angle: -90,
              position: "insideLeft",
              style: {
                fill: "#64748b",
                fontSize: 12,
              },
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              boxShadow:
                "0 4px 12px rgba(15, 23, 42, 0.08)",
            }}
            labelFormatter={(label, payload) => {
              if (
                payload &&
                payload.length > 0 &&
                payload[0]?.payload?.fullDate
              ) {
                return payload[0].payload.fullDate;
              }

              return label;
            }}
            formatter={(value, name) => [
              `${value} min`,
              name,
            ]}
          />

          <Line
            type="monotone"
            dataKey="screen"
            name="Screen Time"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="active"
            name="Active Time"
            stroke="#059669"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="idle"
            name="Idle Time"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* LEGEND */}
      <div className="flex justify-center gap-6 mt-1">

        <LegendItem
          color="bg-blue-600"
          label="Screen Time"
        />

        <LegendItem
          color="bg-emerald-600"
          label="Active Time"
        />

        <LegendItem
          color="bg-amber-500"
          label="Idle Time"
        />

      </div>
    </div>
  );
};

const LegendItem = ({
  color,
  label,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      <span className="text-xs text-slate-500">
        {label}
      </span>
    </div>
  );
};

export default ActivityChart;
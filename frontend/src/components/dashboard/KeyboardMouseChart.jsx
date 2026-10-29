import React, { useMemo } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const KeyboardMouseChart = ({ records = [] }) => {

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

        name: date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),

        fullDate: date.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        Keyboard: 0,
        Mouse: 0,
      });
    }

    // ==========================================================
    // 2. NO RECORDS
    // Still show all 7 days
    // ==========================================================

    if (!records || records.length === 0) {
      return lastSevenDays;
    }

    // ==========================================================
    // 3. SORT ALL RECORDS CHRONOLOGICALLY
    // ==========================================================

    const chronological = [...records].sort(
      (a, b) => {

        const timeA = new Date(
          a.created_at ||
          a.timestamp ||
          a.recorded_at
        ).getTime();

        const timeB = new Date(
          b.created_at ||
          b.timestamp ||
          b.recorded_at
        ).getTime();

        return timeA - timeB;
      }
    );

    // ==========================================================
    // 4. GROUP RECORDS BY MONITORING SESSION
    //
    // IMPORTANT:
    // keyboard_count and mouse_clicks are cumulative
    // counters within a session.
    //
    // We MUST NOT subtract records from different sessions.
    // ==========================================================

    const sessions = {};

    chronological.forEach((record) => {

      const sessionKey =
        record.session_id ?? "no-session";

      if (!sessions[sessionKey]) {
        sessions[sessionKey] = [];
      }

      sessions[sessionKey].push(record);
    });

    // ==========================================================
    // 5. CALCULATE REAL ACTIVITY FOR EACH RECORD
    // ==========================================================

    Object.values(sessions).forEach(
      (sessionRecords) => {

        let previousKeyboard = 0;
        let previousMouse = 0;

        sessionRecords.forEach(
          (record, index) => {

            const keyboardCurrent =
              Number(record.keyboard_count) || 0;

            const mouseCurrent =
              Number(record.mouse_clicks) || 0;

            let keyboardActivity;
            let mouseActivity;

            // --------------------------------------------------
            // FIRST RECORD OF SESSION
            //
            // Counter already represents activity accumulated
            // since this session started.
            // --------------------------------------------------

            if (index === 0) {

              keyboardActivity =
                Math.max(0, keyboardCurrent);

              mouseActivity =
                Math.max(0, mouseCurrent);

            } else {

              // ------------------------------------------------
              // FOLLOWING RECORDS
              //
              // Convert cumulative counter into interval
              // activity.
              // ------------------------------------------------

              keyboardActivity =
                Math.max(
                  0,
                  keyboardCurrent -
                    previousKeyboard
                );

              mouseActivity =
                Math.max(
                  0,
                  mouseCurrent -
                    previousMouse
                );
            }

            // Save current counters for next record
            previousKeyboard =
              keyboardCurrent;

            previousMouse =
              mouseCurrent;

            // ==================================================
            // 6. FIND THE DATE OF THIS RECORD
            // ==================================================

            const timestamp =
              record.created_at ||
              record.timestamp ||
              record.recorded_at;

            if (!timestamp) {
              return;
            }

            const date = new Date(timestamp);

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              return;
            }

            const recordDate =
              new Date(date);

            recordDate.setHours(
              0,
              0,
              0,
              0
            );

            const dateKey =
              `${recordDate.getFullYear()}-` +
              `${String(
                recordDate.getMonth() + 1
              ).padStart(2, "0")}-` +
              `${String(
                recordDate.getDate()
              ).padStart(2, "0")}`;

            // ==================================================
            // 7. FIND THAT DAY IN LAST 7 DAYS
            // ==================================================

            const day =
              lastSevenDays.find(
                (item) =>
                  item.dateKey ===
                  dateKey
              );

            if (!day) {
              return;
            }

            // ==================================================
            // 8. ADD REAL INTERVAL ACTIVITY
            // ==================================================

            day.Keyboard +=
              keyboardActivity;

            day.Mouse +=
              mouseActivity;
          }
        );
      }
    );

    // ==========================================================
    // 9. RETURN ALL 7 DAYS
    // ==========================================================

    return lastSevenDays;

  }, [records]);


  return (
    <div
      className="
        bg-white
        rounded-lg
        border border-slate-200
        p-6
        h-[420px]
        shadow-sm
        hover:shadow-md
        transition
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        <h2 className="text-xl font-bold text-slate-800">
          Keyboard vs Mouse Activity
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Last 7 days
        </p>

      </div>


      {/* ======================================================
          CHART
      ====================================================== */}

      <ResponsiveContainer
        width="100%"
        height="80%"
      >

        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >

          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="name"
            stroke="#64748b"
            tick={{
              fontSize: 12,
            }}
          />

          <YAxis
            stroke="#64748b"
            allowDecimals={false}
          />

          <Tooltip
            labelFormatter={(
              label,
              payload
            ) => {

              if (
                payload &&
                payload.length > 0 &&
                payload[0]?.payload?.fullDate
              ) {
                return payload[0]
                  .payload
                  .fullDate;
              }

              return label;
            }}

            formatter={(
              value,
              name
            ) => [

              value,

              name === "Keyboard"
                ? "Keystrokes"
                : "Mouse Clicks",

            ]}
          />

          <Bar
            dataKey="Keyboard"
            name="Keyboard"
            fill="#3B82F6"
            radius={[
              6,
              6,
              0,
              0,
            ]}
          />

          <Bar
            dataKey="Mouse"
            name="Mouse"
            fill="#A855F7"
            radius={[
              6,
              6,
              0,
              0,
            ]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
};

export default KeyboardMouseChart;
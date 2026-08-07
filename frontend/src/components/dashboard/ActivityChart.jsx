import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "9 AM", screen: 30, typing: 45, mouse: 20 },
  { time: "10 AM", screen: 45, typing: 55, mouse: 35 },
  { time: "11 AM", screen: 70, typing: 60, mouse: 55 },
  { time: "12 PM", screen: 80, typing: 70, mouse: 60 },
  { time: "1 PM", screen: 60, typing: 52, mouse: 48 },
  { time: "2 PM", screen: 90, typing: 82, mouse: 75 },
  { time: "3 PM", screen: 100, typing: 92, mouse: 82 },
];

export default function ActivityChart() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg h-[420px]">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">
          Live Productivity & Activity
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Screen Time • Typing Speed • Mouse Activity
        </p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#233046"
          />

          <XAxis
            dataKey="time"
            stroke="#94a3b8"
          />

          <YAxis stroke="#94a3b8" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="screen"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="typing"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="mouse"
            stroke="#a855f7"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}
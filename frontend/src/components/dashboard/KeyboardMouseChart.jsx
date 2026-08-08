import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Mon", Keyboard: 850, Mouse: 420 },
  { name: "Tue", Keyboard: 1020, Mouse: 510 },
  { name: "Wed", Keyboard: 930, Mouse: 460 },
  { name: "Thu", Keyboard: 1200, Mouse: 610 },
  { name: "Fri", Keyboard: 980, Mouse: 520 },
];

const KeyboardMouseChart = () => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-[420px] shadow-lg">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">
          Keyboard vs Mouse Activity
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Weekly interaction comparison
        </p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid stroke="#233046" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="Keyboard" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Mouse" fill="#A855F7" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};

export default KeyboardMouseChart;
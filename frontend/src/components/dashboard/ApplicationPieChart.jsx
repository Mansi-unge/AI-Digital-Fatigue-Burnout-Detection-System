import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "VS Code", value: 40 },
  { name: "Chrome", value: 30 },
  { name: "Word", value: 15 },
  { name: "Teams", value: 10 },
  { name: "Others", value: 5 },
];

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#A855F7",
  "#EF4444",
];

const ApplicationPieChart = () => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-[420px] shadow-lg">

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">
          Application Usage
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Time spent on active applications
        </p>
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 border-t border-slate-800 pt-4">
        <p className="text-sm text-slate-400">
          Most used application today:
        </p>

        <h3 className="text-lg font-semibold text-blue-400 mt-1">
          VS Code (40%)
        </h3>
      </div>

    </div>
  );
};

export default ApplicationPieChart;
import React from "react";
import {
  FileText,
  TrendingUp,
  Clock3,
  Activity,
  BrainCircuit,
} from "lucide-react";

const Reports = () => {
  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Reports
        </h1>

        <p className="mt-2 text-slate-400">
          Review your digital activity, fatigue, and burnout analysis.
        </p>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <Clock3 className="text-blue-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Total Work Time
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            6h 45m
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <Activity className="text-purple-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Productivity
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-400">
            84%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <BrainCircuit className="text-orange-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Fatigue Score
          </p>

          <h2 className="mt-2 text-3xl font-bold text-orange-400">
            42%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <TrendingUp className="text-emerald-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Weekly Trend
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-400">
            +8%
          </h2>
        </div>

      </div>

      {/* Report Information */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3">
          <FileText className="text-blue-400" size={24} />

          <h2 className="text-xl font-bold text-white">
            Digital Fatigue Report
          </h2>
        </div>

        <p className="mt-4 text-slate-400">
          Your report summarizes digital activity, productivity,
          fatigue levels, and AI-based burnout indicators.
        </p>

        <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="font-semibold text-blue-400">
            Current Assessment
          </p>

          <p className="mt-1 text-sm text-blue-300">
            Your current fatigue and productivity levels are within
            the monitored healthy range.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Reports;
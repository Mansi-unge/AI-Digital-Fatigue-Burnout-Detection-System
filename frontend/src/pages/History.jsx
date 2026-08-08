import React from "react";
import {
  History as HistoryIcon,
  CalendarDays,
  BrainCircuit,
  Activity,
  CheckCircle2,
} from "lucide-react";

const History = () => {
  return (
    <div className="max-w-[1700px] mx-auto px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Activity History
        </h1>

        <p className="mt-2 text-slate-400">
          Review your previous digital fatigue and activity records.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <CalendarDays className="text-blue-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Records
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            24
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <Activity className="text-purple-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Avg. Productivity
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-400">
            84%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <BrainCircuit className="text-orange-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Avg. Fatigue
          </p>

          <h2 className="mt-2 text-3xl font-bold text-orange-400">
            42%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <CheckCircle2 className="text-emerald-400" size={28} />

          <p className="mt-5 text-sm text-slate-400">
            Healthy Sessions
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-400">
            18
          </h2>
        </div>

      </div>

      {/* History List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center gap-3 mb-6">
          <HistoryIcon className="text-blue-400" size={24} />

          <h2 className="text-xl font-bold text-white">
            Recent Records
          </h2>
        </div>

        <div className="space-y-3">

          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">
            <div>
              <p className="font-medium text-white">
                August 7, 2026
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Work session • 6h 45m
              </p>
            </div>

            <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
              Healthy
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">
            <div>
              <p className="font-medium text-white">
                August 6, 2026
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Work session • 7h 10m
              </p>
            </div>

            <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400">
              Moderate
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4">
            <div>
              <p className="font-medium text-white">
                August 5, 2026
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Work session • 8h 05m
              </p>
            </div>

            <span className="rounded-lg bg-orange-500/10 px-3 py-1 text-sm text-orange-400">
              Elevated
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default History;
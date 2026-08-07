import React from "react";
import {
  BrainCircuit,
  ShieldCheck,
  Activity,
  Clock3,
  Sparkles,
} from "lucide-react";

/**
 * ============================================================
 * Overview Banner
 * ------------------------------------------------------------
 * Top summary section for the AI Digital Fatigue &
 * Burnout Detection System Dashboard.
 *
 * Displays:
 * - Welcome Message
 * - Overall Health Score
 * - AI Monitoring Status
 * - Last Synchronization Time
 * - Quick Statistics
 * ============================================================
 */

const OverviewBanner = () => {
  const healthScore = 82;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 p-8 shadow-2xl">

      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          <div>
            <p className="text-slate-400 text-sm uppercase tracking-[4px]">
              AI DIGITAL FATIGUE & BURNOUT DETECTION SYSTEM
            </p>

            <h1 className="mt-3 text-4xl font-bold text-white">
              Welcome Back,
              <span className="text-blue-400"> Amruta 👋</span>
            </h1>

            <p className="mt-2 text-lg text-slate-400">
              Real-time AI monitoring is actively analyzing your
              productivity, fatigue level, and work behaviour.
            </p>
          </div>

          {/* Health Score */}

          <div>

            <div className="flex justify-between mb-2">

              <span className="text-sm text-slate-400">
                Overall Health Score
              </span>

              <span className="font-bold text-emerald-400">
                {healthScore}%
              </span>

            </div>

            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 transition-all duration-1000"
                style={{ width: `${healthScore}%` }}
              />

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="grid grid-cols-2 gap-5">

          {/* Monitoring */}

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">

            <div className="flex items-center gap-3">

              <Activity className="text-emerald-400" size={28} />

              <div>

                <p className="text-slate-400 text-sm">
                  Monitoring
                </p>

                <h3 className="font-bold text-white">
                  Active
                </h3>

              </div>

            </div>

          </div>

          {/* AI Status */}

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">

            <div className="flex items-center gap-3">

              <BrainCircuit className="text-blue-400" size={28} />

              <div>

                <p className="text-slate-400 text-sm">
                  AI Status
                </p>

                <h3 className="font-bold text-white">
                  Normal
                </h3>

              </div>

            </div>

          </div>

          {/* Fatigue */}

          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">

            <div className="flex items-center gap-3">

              <ShieldCheck className="text-orange-400" size={28} />

              <div>

                <p className="text-slate-400 text-sm">
                  Burnout Risk
                </p>

                <h3 className="font-bold text-white">
                  Low
                </h3>

              </div>

            </div>

          </div>

          {/* Last Sync */}

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">

            <div className="flex items-center gap-3">

              <Clock3 className="text-cyan-400" size={28} />

              <div>

                <p className="text-slate-400 text-sm">
                  Last Sync
                </p>

                <h3 className="font-bold text-white">
                  Just Now
                </h3>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom AI Recommendation */}

      <div className="relative z-10 mt-8 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/40 px-6 py-4">

        <Sparkles
          className="text-yellow-400"
          size={22}
        />

        <p className="text-slate-300">

          <span className="font-semibold text-white">
            AI Recommendation:
          </span>

          {" "}
          Your work pattern is healthy today. Continue working, but
          remember to take a short break after approximately
          <span className="font-semibold text-blue-400">
            {" "}25 minutes
          </span>
          .

        </p>

      </div>

    </section>
  );
};

export default OverviewBanner;
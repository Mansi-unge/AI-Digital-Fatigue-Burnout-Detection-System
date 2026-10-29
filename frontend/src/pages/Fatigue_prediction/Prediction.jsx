import React from "react";
import {
  BrainCircuit,
  Activity,
  HeartPulse,
  AlertTriangle,
  Clock3,
  Eye,
  MousePointer2,
  Keyboard,
  Thermometer,
  TrendingUp,
  Info,
} from "lucide-react";

/* -------------------------------------------------------
   Reusable score card
------------------------------------------------------- */

const ScoreCard = ({
  icon: Icon,
  title,
  value,
  status,
  description,
  iconBg = "bg-violet-50",
  iconColor = "text-violet-600",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <div className="mt-3 flex items-end gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {value ?? "—"}
            </span>

            {value !== null && value !== undefined && (
              <span className="mb-1 text-sm font-medium text-slate-400">
                /100
              </span>
            )}
          </div>

          <div className="mt-2">
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {status || "Waiting for data"}
            </span>
          </div>

          {description && (
            <p className="mt-3 text-xs leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Contributing factor
------------------------------------------------------- */

const FactorRow = ({ icon: Icon, label, value = "Waiting for data" }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3.5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>

        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>

      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        {value}
      </span>
    </div>
  );
};

/* -------------------------------------------------------
   Main page
------------------------------------------------------- */

const Prediction = () => {
  return (
    <div className="min-h-full bg-[#f5f7fb] p-5 lg:p-7">
      <div className="mx-auto max-w-[1500px]">

        {/* =================================================
            PAGE HEADER
        ================================================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                <BrainCircuit className="h-5 w-5 text-violet-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Fatigue Prediction
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  AI-powered analysis of your current condition
                </p>
              </div>
            </div>
          </div>

          {/* Monitoring status */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-300 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-slate-400" />
            </span>

            <span className="text-sm font-semibold text-slate-600">
              Waiting for monitoring data
            </span>
          </div>
        </div>

        {/* =================================================
            INFO BANNER
        ================================================= */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />

          <div>
            <p className="text-sm font-semibold text-violet-900">
              Fatigue assessment will appear here
            </p>

            <p className="mt-1 text-sm leading-6 text-violet-700">
              Start AI Monitoring to collect activity, camera, and environmental
              data. Prediction values will appear once sufficient monitoring
              data is available.
            </p>
          </div>
        </div>

        {/* =================================================
            SCORE CARDS
        ================================================= */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ScoreCard
            icon={Activity}
            title="Fatigue Score"
            value={null}
            status="Waiting for data"
            description="Current estimated digital fatigue level."
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <ScoreCard
            icon={AlertTriangle}
            title="Burnout Risk"
            value={null}
            status="Waiting for data"
            description="Current estimated burnout risk."
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />

          <ScoreCard
            icon={HeartPulse}
            title="Health Score"
            value={null}
            status="Waiting for data"
            description="Overall monitoring-based health indicator."
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">

          {/* -----------------------------------------------
              CONTRIBUTING FACTORS
          ----------------------------------------------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Contributing Factors
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Monitoring signals that may contribute to fatigue assessment
              </p>
            </div>

            <div>
              <FactorRow
                icon={Clock3}
                label="Screen Time"
              />

              <FactorRow
                icon={Clock3}
                label="Idle Time"
              />

              <FactorRow
                icon={Eye}
                label="Eye Closure"
              />

              <FactorRow
                icon={Eye}
                label="Blink Rate"
              />

              <FactorRow
                icon={Activity}
                label="Yawns"
              />

              <FactorRow
                icon={Keyboard}
                label="Keyboard Activity"
              />

              <FactorRow
                icon={MousePointer2}
                label="Mouse Activity"
              />

              <FactorRow
                icon={Thermometer}
                label="Environment"
              />
            </div>
          </div>

          {/* -----------------------------------------------
              FATIGUE TREND
          ----------------------------------------------- */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Fatigue Trend
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Fatigue assessment over the current monitoring session
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </div>
            </div>

            {/* Empty chart state */}
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>

              <p className="text-sm font-semibold text-slate-600">
                Waiting for fatigue data
              </p>

              <p className="mt-1 max-w-sm text-center text-xs leading-5 text-slate-400">
                The fatigue trend will be displayed here once monitoring data
                and prediction results are available.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            PREDICTION NOTE
        ================================================= */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <BrainCircuit className="h-4 w-4 text-slate-500" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Prediction status
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                The prediction engine has not been connected yet. This page is
                ready to receive fatigue, burnout, health, and contributing
                factor data from the backend.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Prediction;
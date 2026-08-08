import React from "react";
import {
  Thermometer,
  Sun,
  Monitor,
  Battery,
} from "lucide-react";

const EnvironmentCard = () => {
  return (
    <div
      className="
        bg-slate-900
        rounded-2xl
        border
        border-slate-800
        p-6
        shadow-lg
        transition-all
        duration-300
        hover:border-blue-500/40
        hover:shadow-blue-500/10
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
          <Thermometer
            size={22}
            className="text-blue-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Environment
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Current workspace conditions
          </p>
        </div>

      </div>

      {/* Environment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Temperature */}
        <div className="rounded-xl bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <Thermometer
                size={20}
                className="text-blue-400"
              />

              <span className="text-sm text-slate-400">
                Temperature
              </span>
            </div>

            <span className="text-lg font-semibold text-white">
              27°C
            </span>

          </div>
        </div>

        {/* Light */}
        <div className="rounded-xl bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <Sun
                size={20}
                className="text-yellow-400"
              />

              <span className="text-sm text-slate-400">
                Light
              </span>
            </div>

            <span className="text-lg font-semibold text-white">
              420 Lux
            </span>

          </div>
        </div>

        {/* Brightness */}
        <div className="rounded-xl bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <Monitor
                size={20}
                className="text-purple-400"
              />

              <span className="text-sm text-slate-400">
                Brightness
              </span>
            </div>

            <span className="text-lg font-semibold text-white">
              80%
            </span>

          </div>
        </div>

        {/* Battery */}
        <div className="rounded-xl bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <Battery
                size={20}
                className="text-emerald-400"
              />

              <span className="text-sm text-slate-400">
                Battery
              </span>
            </div>

            <span className="text-lg font-semibold text-emerald-400">
              87%
            </span>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EnvironmentCard;
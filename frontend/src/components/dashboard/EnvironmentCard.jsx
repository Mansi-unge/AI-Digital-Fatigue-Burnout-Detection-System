import React from "react";
import {
  Thermometer,
  Sun,
  Waves,
  Ruler,
  Activity,
} from "lucide-react";

const EnvironmentCard = ({ latest }) => {
  return (
    <div
      className="
        bg-white
        rounded-lg
        border border-slate-200
        p-6
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Environment
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Current workspace conditions
          </p>
        </div>

        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Thermometer
            size={21}
            className="text-blue-600"
          />
        </div>
      </div>

      {/* Environment Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Temperature */}
        <EnvironmentItem
          icon={Thermometer}
          iconStyle="bg-orange-50 text-orange-500"
          title="Temperature"
          value={
            latest?.temperature != null
              ? `${Number(latest.temperature).toFixed(1)}°C`
              : "—"
          }
        />

        {/* Humidity */}
        <EnvironmentItem
          icon={Waves}
          iconStyle="bg-blue-50 text-blue-600"
          title="Humidity"
          value={
            latest?.humidity != null
              ? `${Number(latest.humidity).toFixed(1)}%`
              : "—"
          }
        />

        {/* Light */}
        <EnvironmentItem
          icon={Sun}
          iconStyle="bg-yellow-50 text-yellow-600"
          title="Light"
          value={
            latest?.light != null
              ? `${Number(latest.light).toFixed(1)} Lux`
              : "—"
          }
        />

        {/* Distance */}
        <EnvironmentItem
          icon={Ruler}
          iconStyle="bg-violet-50 text-violet-600"
          title="Distance"
          value={
            latest?.distance != null
              ? `${Number(latest.distance).toFixed(1)} cm`
              : "—"
          }
        />

        {/* Motion */}
        <EnvironmentItem
          icon={Activity}
          iconStyle="bg-emerald-50 text-emerald-600"
          title="Motion"
          value={
            latest?.motion != null
              ? latest.motion
                ? "Detected"
                : "No Motion"
              : "—"
          }
        />

      </div>
    </div>
  );
};

const EnvironmentItem = ({
  icon: Icon,
  iconStyle,
  title,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconStyle}`}
          >
            <Icon size={18} />
          </div>

          <span className="text-sm text-slate-500">
            {title}
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-800">
          {value}
        </span>

      </div>
    </div>
  );
};

export default EnvironmentCard;

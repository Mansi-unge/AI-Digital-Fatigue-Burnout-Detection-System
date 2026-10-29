import React from "react";
import {
  Battery,
  Monitor,
  Zap,
} from "lucide-react";

const DeviceStatusCard = ({ latest }) => {
  // Backend values
  const battery =
    latest?.battery_percentage != null
      ? Number(latest.battery_percentage)
      : null;

  const brightness =
    latest?.brightness != null
      ? Number(latest.brightness)
      : null;

  // Supports either boolean is_charging or a charging_status field
  const isCharging =
    latest?.is_charging === true ||
    latest?.charging_status === true ||
    latest?.charging_status === "Charging";

  const batteryValue =
    battery != null && Number.isFinite(battery)
      ? Math.max(0, Math.min(100, battery))
      : null;

  const brightnessValue =
    brightness != null && Number.isFinite(brightness)
      ? Math.max(0, Math.min(100, brightness))
      : null;

  const getBatteryStatus = () => {
    if (batteryValue == null) return "Unavailable";
    if (batteryValue <= 20) return "Low";
    if (batteryValue <= 40) return "Warning";
    return "Healthy";
  };

  const batteryStatus = getBatteryStatus();

  const batteryStatusStyle =
    batteryStatus === "Low"
      ? "text-red-600"
      : batteryStatus === "Warning"
        ? "text-amber-600"
        : batteryStatus === "Healthy"
          ? "text-emerald-600"
          : "text-slate-500";

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
            Device Status
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Current system information
          </p>
        </div>

        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Monitor
            size={21}
            className="text-blue-600"
          />
        </div>
      </div>

      <div className="space-y-4">

        {/* Battery */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Battery
                  size={19}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Battery
                </p>

                <p className="font-semibold text-slate-800">
                  {batteryValue != null
                    ? `${batteryValue.toFixed(0)}%`
                    : "—"}
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-medium ${batteryStatusStyle}`}
            >
              {batteryStatus}
            </span>
          </div>

          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width:
                  batteryValue != null
                    ? `${batteryValue}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        {/* Charging */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-3">

            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Zap
                size={18}
                className="text-blue-600"
              />
            </div>

            <span className="text-sm text-slate-600">
              Charging Status
            </span>
          </div>

          <span
            className={`font-semibold ${
              isCharging
                ? "text-blue-600"
                : "text-slate-800"
            }`}
          >
            {latest?.is_charging != null ||
            latest?.charging_status != null
              ? isCharging
                ? "Charging"
                : "Not Charging"
              : "—"}
          </span>
        </div>

        {/* Brightness */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-3">

            <Monitor
              size={19}
              className="text-violet-600"
            />

            <span className="text-sm text-slate-600">
              Brightness
            </span>
          </div>

          <span className="font-semibold text-slate-800">
            {brightnessValue != null
              ? `${brightnessValue.toFixed(0)}%`
              : "—"}
          </span>
        </div>

      </div>
    </div>
  );
};

export default DeviceStatusCard;

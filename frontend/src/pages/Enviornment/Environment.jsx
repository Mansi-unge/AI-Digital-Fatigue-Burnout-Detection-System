import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CloudSun,
  Droplets,
  Gauge,
  Lightbulb,
  RefreshCw,
  Ruler,
  Thermometer,
  Wifi,
  WifiOff,
} from "lucide-react";
import api from "../../api/axios";

const Environment = () => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [monitoringActive, setMonitoringActive] = useState(null);
  const [environmentLive, setEnvironmentLive] = useState(false);
  const [iotLastReceived, setIotLastReceived] = useState(null);

  // IoT/environment data is considered live only when a fresh reading has
  // arrived recently. Existing database values are kept as the last captured
  // reading when the ESP32/IoT process is not running.
  const ENVIRONMENT_FRESHNESS_MS = 25000;

  // Backend activity timestamps are stored as UTC. Some responses may contain
  // a timezone suffix, while older responses can be timezone-naive. Treat
  // timezone-naive ISO timestamps as UTC so freshness and displayed local time
  // are calculated correctly in the browser.
  const parseBackendDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const raw = String(value).trim();
    if (!raw) return null;

    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
    const normalized = hasTimezone ? raw : `${raw}Z`;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getUserId = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.id !== undefined && user?.id !== null) {
          return user.id;
        }
      } catch (err) {
        console.error("Invalid user data:", err);
      }
    }

    return localStorage.getItem("user_id") || null;
  };

  const readMonitoringState = (payload) => {
    const data = payload?.data ?? payload ?? {};

    const candidates = [
      data?.is_running,
      data?.running,
      data?.monitoring_active,
      data?.monitoringActive,
      data?.active,
      data?.status === "running",
      data?.status === "active",
      data?.data?.is_running,
      data?.data?.running,
      data?.data?.monitoring_active,
      data?.data?.monitoringActive,
      data?.data?.active,
      data?.data?.status === "running",
      data?.data?.status === "active",
    ];

    const value = candidates.find((item) => typeof item === "boolean");
    return value ?? null;
  };

  const fetchMonitoringState = useCallback(async () => {
    try {
      const response = await api.get("/monitoring/status");
      const state = readMonitoringState(response?.data);

      if (state !== null) {
        setMonitoringActive(state);
      }
    } catch (err) {
      // Do not clear the last known state if the status request temporarily fails.
      console.warn("Monitoring status unavailable:", err);
    }
  }, []);

  const fetchEnvironmentData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const userId = getUserId();

      if (!userId) {
        setError("Please log in again to access environment monitoring.");
        return;
      }

      const [response] = await Promise.all([
        api.get(
          `/monitoring/data?user_id=${encodeURIComponent(userId)}`
        ),
        fetchMonitoringState(),
      ]);

      const responseData = response?.data;

      if (!responseData?.success) {
        throw new Error(
          responseData?.message ||
            "Unable to load environment monitoring data."
        );
      }

      const records = Array.isArray(responseData.data)
        ? responseData.data
        : [];

      const sorted = [...records].sort(
        (a, b) =>
          (parseBackendDate(b?.created_at)?.getTime() || 0) -
          (parseBackendDate(a?.created_at)?.getTime() || 0)
      );

      // Only use a record that contains actual environment data.
      // History is intentionally handled by the separate History page.
      const latestEnvironmentReading = sorted.find((item) =>
        [
          item?.temperature,
          item?.humidity,
          item?.light,
          item?.distance,
          item?.motion,
        ].some((value) => value !== null && value !== undefined)
      );

      if (latestEnvironmentReading) {
        setLatest((previous) => ({
          ...previous,
          ...latestEnvironmentReading,
          temperature:
            latestEnvironmentReading.temperature ??
            previous?.temperature ??
            null,
          humidity:
            latestEnvironmentReading.humidity ??
            previous?.humidity ??
            null,
          light:
            latestEnvironmentReading.light ??
            previous?.light ??
            null,
          distance:
            latestEnvironmentReading.distance ??
            previous?.distance ??
            null,
          motion:
            latestEnvironmentReading.motion ??
            previous?.motion ??
            null,
          created_at:
            latestEnvironmentReading.created_at ??
            previous?.created_at ??
            null,
        }));

        // IMPORTANT: live state comes from the dedicated IoT heartbeat,
        // not from activity.created_at. The activity logger can keep saving
        // cached values after the ESP32 stops.
        const iotLive = responseData?.iot_live === true;
        setIotLastReceived(responseData?.iot_last_received ?? null);
        setEnvironmentLive(iotLive && monitoringActive !== false);
      } else {
        setEnvironmentLive(false);
      }
    } catch (err) {
      console.error("Environment data error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load environment monitoring data.";

      setError(
        backendMessage === "Network Error"
          ? "Environment monitoring service is unavailable. Please make sure the backend is running."
          : backendMessage
      );

      // Keep the last valid reading visible during temporary failures.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEnvironmentData(false);
  }, [fetchEnvironmentData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEnvironmentData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchEnvironmentData]);

  useEffect(() => {
    if (monitoringActive === false) {
      setEnvironmentLive(false);
    }
  }, [monitoringActive]);

  const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined || value === "") return "—";

    const number = Number(value);
    return Number.isNaN(number) ? "—" : number.toFixed(decimals);
  };

  const formatTime = (value) => {
    if (!value) return "--:--";

    const date = parseBackendDate(value);
    if (!date) return "--:--";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "No reading available";

    const date = parseBackendDate(value);
    if (!date) return String(value);

    return date.toLocaleString();
  };

  const sensors = useMemo(
    () => [
      {
        key: "temperature",
        label: "Temperature",
        description: "Room temperature",
        value: latest?.temperature,
        unit: "°C",
        icon: Thermometer,
        iconClass: "bg-orange-50 text-orange-500",
        barClass: "bg-orange-500",
      },
      {
        key: "humidity",
        label: "Humidity",
        description: "Relative humidity",
        value: latest?.humidity,
        unit: "%",
        icon: Droplets,
        iconClass: "bg-sky-50 text-sky-500",
        barClass: "bg-sky-500",
      },
      {
        key: "light",
        label: "Ambient Light",
        description: "Workspace illumination",
        value: latest?.light,
        unit: "Lux",
        icon: Lightbulb,
        iconClass: "bg-yellow-50 text-yellow-600",
        barClass: "bg-yellow-500",
      },
      {
        key: "distance",
        label: "Distance",
        description: "Ultrasonic reading",
        value: latest?.distance,
        unit: "cm",
        icon: Ruler,
        iconClass: "bg-violet-50 text-violet-500",
        barClass: "bg-violet-500",
      },
      {
        key: "motion",
        label: "Motion",
        description: "PIR activity detection",
        value: latest?.motion,
        unit: "",
        icon: Activity,
        iconClass: "bg-emerald-50 text-emerald-500",
        barClass: "bg-emerald-500",
      },
    ],
    [latest]
  );

  // Database values represent the last captured reading. They do not mean
  // that the sensor is currently connected or sending data.
  const sensorsWithData = sensors.filter(
    (sensor) => sensor.value !== null && sensor.value !== undefined
  ).length;

  const activeSensors = environmentLive ? sensorsWithData : 0;
  const allSensorsActive =
    environmentLive && sensorsWithData === sensors.length;
  const environmentAvailable = environmentLive && sensorsWithData > 0;

  const motionDetected =
    latest?.motion === null || latest?.motion === undefined
      ? null
      : Boolean(latest.motion);

  const status = useMemo(() => {
    if (allSensorsActive) {
      return {
        label: "Environment Active",
        description: "All connected environmental sensors are reporting.",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    }

    if (activeSensors > 0) {
      return {
        label: "Partially Active",
        description: `${activeSensors} of ${sensors.length} sensors are reporting.`,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    }

    return {
      label: "Waiting for Data",
      description: "No environmental sensor readings are available.",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    };
  }, [activeSensors, allSensorsActive, sensors.length]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#f5f7fb] p-6 lg:p-8">
        <div className="min-h-[650px] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading Environment Workspace
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Connecting to the environmental sensor service...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f5f7fb] text-slate-800 p-5 sm:p-6 lg:px-8 py-4">
      <div className="max-w-[1600px] mx-auto">

        {/* HEADER — same visual rhythm as Camera Data */}
        <header className="mb-7">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-200 flex items-center justify-center shrink-0">
                <CloudSun className="w-7 h-7 text-white" />
                <span
                  className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-[3px] border-[#f5f7fb] ${status.dot}`}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Environment
                  </h1>

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                      latest
                        ? environmentLive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                        : status.className
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        latest
                          ? environmentLive
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {latest
                      ? environmentLive
                        ? "Live data"
                        : "Last shown data"
                      : "Waiting for data"}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  Real-time workspace conditions from connected IoT sensors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Auto refresh
                </span>
                <span className="text-xs font-bold text-slate-700">10s</span>
              </div>

              <button
                type="button"
                onClick={() => fetchEnvironmentData(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-sm font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-800">
                Environment monitoring issue
              </p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* PRIMARY WORKSPACE */}
        <section className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)] gap-6 mb-7">

          {/* LIVE ENVIRONMENT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Live Environment
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Current workspace sensor readings
                  </p>
                </div>
              </div>

              <div
                className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  environmentAvailable
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                {environmentLive ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span
                  className={`text-[11px] font-bold ${
                    environmentLive ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {environmentLive ? "SENSORS ONLINE" : "LAST SHOWN DATA"}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {/* Highlight reading */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center">
                      <Thermometer className="w-7 h-7 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Primary condition
                      </p>
                      <p className="text-base font-bold text-slate-700 mt-1">
                        Temperature
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current room temperature
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
                      {formatNumber(latest?.temperature)}
                    </span>
                    <span className="ml-1 text-lg font-bold text-slate-400">
                      °C
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary readings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {sensors.slice(1).map((sensor) => {
                  const Icon = sensor.icon;

                  // "Available" means the sensor is sending a fresh reading
                  // right now. Keep old values visible as "Last shown".
                  const hasValue =
                    sensor.value !== null && sensor.value !== undefined;
                  const available = environmentLive && hasValue;

                  const displayValue =
                    sensor.key === "motion"
                      ? motionDetected === null
                        ? "—"
                        : motionDetected
                        ? "Detected"
                        : "No Motion"
                      : formatNumber(sensor.value);

                  return (
                    <div
                      key={sensor.key}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 p-4 hover:bg-white hover:shadow-sm transition"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${sensor.barClass}`} />

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sensor.iconClass}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {sensor.label}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {sensor.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xl font-extrabold text-slate-900">
                            {displayValue}
                          </div>
                          {sensor.unit && (
                            <span className="text-[10px] font-bold text-slate-400">
                              {sensor.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            available ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            available ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {available
                            ? "Live reading"
                            : hasValue
                            ? "Last shown"
                            : "No reading"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Latest update */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center ">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-800" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-900">
                      {environmentLive ? "Live data" : "Last shown data"}
                    </p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">
                      {latest
                        ? formatDateTime(latest.created_at)
                        : "No reading available"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-500">
                  {environmentLive
                    ? "Live updates every 10 seconds"
                    : "IoT source is not currently sending data"}
                </span>
              </div>
            </div>
          </div>

          {/* SENSOR CONTROL / HEALTH PANEL */}
          <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {environmentLive ? (
                    <Wifi className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-amber-600" />
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    IoT Connection
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    Sensor Status
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-2 sm:p-6">
              {/* Overall status */}
              <div
                className={`rounded-2xl border p-5 ${
                  allSensorsActive
                    ? "bg-emerald-50/70 border-emerald-200"
                    : activeSensors > 0
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      System status
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                      {environmentLive
                        ? allSensorsActive
                          ? "Environment Online"
                          : activeSensors > 0
                          ? "Partially Reporting"
                          : "Awaiting Data"
                        : latest
                        ? "IoT Data Offline"
                        : "Awaiting Data"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {environmentLive
                        ? `${activeSensors} of ${sensors.length} sensors reporting`
                        : latest
                        ? "Showing the last captured sensor values"
                        : "No sensor measurement is currently available."}
                    </p>
                  </div>

                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      environmentLive
                        ? allSensorsActive
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                        : latest
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {environmentLive ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : latest ? (
                      <WifiOff className="w-6 h-6" />
                    ) : (
                      <WifiOff className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {environmentLive ? "Sensor availability" : "Last captured values"}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-800">
                      {activeSensors}/{sensors.length}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        allSensorsActive
                          ? "bg-emerald-500"
                          : activeSensors > 0
                          ? "bg-amber-500"
                          : "bg-slate-300"
                      }`}
                      style={{
                        width: `${(activeSensors / sensors.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sensor list */}
              <div className="mt-4 space-y-2.5 grid grid-cols-2 gap-3">
                {sensors.map((sensor) => {
                  const Icon = sensor.icon;
                  const hasValue =
                    sensor.value !== null && sensor.value !== undefined;
                  const active = environmentLive && hasValue;

                  return (
                    <div
                      key={sensor.key}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700">
                            {sensor.label}
                          </p>
                          <p
                            className={`text-[10px] font-bold mt-0.5 ${
                              active ? "text-emerald-600" : "text-slate-400"
                            }`}
                          >
                            {active
                              ? "Available"
                              : hasValue
                              ? "Not Available"
                              : "No reading"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          active
                            ? environmentLive
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                            : "bg-slate-300"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Last update */}
              <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {environmentLive ? "Last live update" : "Last captured reading"}
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {latest ? formatTime(latest.created_at) : "No data"}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        environmentLive
                          ? "text-emerald-500"
                          : latest
                          ? "text-amber-500"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

      </div>
    </div>
  );
};

export default Environment;

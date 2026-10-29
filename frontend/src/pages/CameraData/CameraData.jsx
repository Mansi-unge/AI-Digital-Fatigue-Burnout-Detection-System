import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Info,
  LockKeyhole,
  Move3D,
  RefreshCw,
  ShieldCheck,
  Smile,
  Sparkles,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
} from "lucide-react";

import api from "../../api/axios";
import { toggleCamera, cameraStreamUrl } from "../../api/monitoringApi";

const CameraData = () => {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraToggling, setCameraToggling] = useState(false);
  const [monitoringRunning, setMonitoringRunning] = useState(false);
  const [streamError, setStreamError] = useState(false);

  // ------------------------------------------------------------
  // USER
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // STATUS
  // ------------------------------------------------------------

  const fetchCameraStatus = useCallback(async () => {
    try {
      const userId = getUserId();

      if (!userId) return;

      const statusResponse = await api.get("/monitoring/status");
      const status = statusResponse?.data;
      const isRunning = Boolean(status?.running);

      setMonitoringRunning(isRunning);

      if (!isRunning) {
        setCameraEnabled(false);
        setStreamError(false);
        return;
      }

      const settingsResponse = await api.get(
        `/settings/${encodeURIComponent(userId)}`
      );

      const settingsData = settingsResponse?.data;

      if (settingsData?.success) {
        setCameraEnabled(
          Boolean(settingsData?.settings?.webcam_monitoring)
        );
      }
    } catch (err) {
      console.error("Failed to fetch camera status:", err);
    }
  }, []);

  // ------------------------------------------------------------
  // DATA
  // ------------------------------------------------------------

  // A monitoring record can still exist after the camera is turned OFF,
  // but its camera fields may be null. Only treat a record as a camera
  // reading when at least one camera measurement was actually captured.
  const hasCameraReading = (record) => {
    if (!record) return false;

    return (
      record.blink_rate !== null &&
      record.blink_rate !== undefined
    ) ||
      (
        record.eye_closure !== null &&
        record.eye_closure !== undefined
      ) ||
      (
        record.yawn_count !== null &&
        record.yawn_count !== undefined
      ) ||
      (
        record.head_pose !== null &&
        record.head_pose !== undefined &&
        String(record.head_pose).trim() !== ""
      );
  };

  const fetchCameraData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const userId = getUserId();

        if (!userId) {
          // Keep the last successful camera reading visible during
        // temporary API/refresh errors. Do not blank the cards.
          setError("Please log in again to access camera monitoring.");
          return;
        }

        const response = await api.get(
          `/monitoring/data?user_id=${encodeURIComponent(userId)}`
        );

        const responseData = response?.data;

        if (!responseData?.success) {
          throw new Error(
            responseData?.message ||
              "Unable to load camera monitoring data."
          );
        }

        const records = Array.isArray(responseData.data)
          ? responseData.data
          : [];

        if (records.length === 0) {
          // Do NOT clear an already captured reading.
          // The last valid camera reading must remain visible.
          return;
        }

        const sortedRecords = [...records].sort((a, b) => {
          const dateA = new Date(a?.created_at || 0).getTime();
          const dateB = new Date(b?.created_at || 0).getTime();

          return dateB - dateA;
        });

        // IMPORTANT:
        // After the camera is turned OFF, the backend may continue to
        // return activity records whose camera fields are null.
        // Do not use such a record as the "latest camera reading".
        const latestCameraRecord = sortedRecords.find(hasCameraReading);

        if (!latestCameraRecord) {
          // There has never been a valid camera reading in the returned data.
          // Keep the current state instead of replacing it with null.
          return;
        }

        setLatestData((previous) => {
          if (!previous) {
            return latestCameraRecord;
          }

          // Preserve the previous value for any camera field that the new
          // record does not contain. Zero is a valid value, so only null/
          // undefined/empty values are considered missing.
          const valueOrPrevious = (newValue, oldValue) =>
            newValue !== null &&
            newValue !== undefined &&
            newValue !== ""
              ? newValue
              : oldValue;

          return {
            ...previous,
            ...latestCameraRecord,
            blink_rate: valueOrPrevious(
              latestCameraRecord.blink_rate,
              previous.blink_rate
            ),
            eye_closure: valueOrPrevious(
              latestCameraRecord.eye_closure,
              previous.eye_closure
            ),
            yawn_count: valueOrPrevious(
              latestCameraRecord.yawn_count,
              previous.yawn_count
            ),
            head_pose: valueOrPrevious(
              latestCameraRecord.head_pose,
              previous.head_pose
            ),
            // Keep the timestamp belonging to the actual camera reading.
            created_at:
              hasCameraReading(latestCameraRecord)
                ? latestCameraRecord.created_at
                : previous.created_at,
          };
        });
      } catch (err) {
        console.error("Failed to fetch camera data:", err);

        const backendMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load camera monitoring data.";

        setError(
          backendMessage === "Network Error"
            ? "Camera monitoring service is unavailable. Please make sure the backend is running."
            : backendMessage
        );

        setLatestData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ------------------------------------------------------------
  // CAMERA TOGGLE
  // ------------------------------------------------------------

  const handleCameraToggle = async () => {
    const userId = getUserId();

    if (!userId) {
      setError("Please log in again to control camera monitoring.");
      return;
    }

    if (!monitoringRunning) {
      setError("Start monitoring before enabling the camera.");
      return;
    }

    const newState = !cameraEnabled;

    try {
      setCameraToggling(true);
      setError("");
      setStreamError(false);

      const response = await toggleCamera(userId, newState);
      const responseData = response?.data;

      if (!responseData?.success) {
        throw new Error(
          responseData?.message || "Unable to update camera status."
        );
      }

      const enabled = Boolean(responseData.enabled);

      setCameraEnabled(enabled);

      if (!enabled) {
        // Intentionally keep latestData.
        // Turning the camera OFF changes the live state, not the last
        // successfully captured measurements.
      }
    } catch (err) {
      console.error("Camera toggle error:", err);

      const backendMessage = err?.response?.data?.message;

      setError(
        backendMessage ||
          "Unable to change camera status. Please try again."
      );
    } finally {
      setCameraToggling(false);
    }
  };

  // ------------------------------------------------------------
  // INITIAL LOAD + AUTO REFRESH
  // ------------------------------------------------------------

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchCameraStatus(),
        fetchCameraData(false),
      ]);
    };

    load();
  }, [fetchCameraStatus, fetchCameraData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCameraStatus();
      fetchCameraData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchCameraStatus, fetchCameraData]);

  // ------------------------------------------------------------
  // FORMATTING
  // ------------------------------------------------------------

  const formatDateTime = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  const formatTime = (value) => {
    if (!value) return "--:--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined || value === "") {
      return "0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) return "0";

    return number.toFixed(decimals);
  };

  // ------------------------------------------------------------
  // HEAD POSE
  // ------------------------------------------------------------

  const getHeadPoseStyle = (pose) => {
    const normalizedPose = String(pose || "UNKNOWN")
      .trim()
      .toUpperCase();

    switch (normalizedPose) {
      case "CENTER":
      case "FORWARD":
      case "STRAIGHT":
        return {
          label: normalizedPose,
          description: "Looking straight ahead",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconClass: "bg-emerald-100 text-emerald-600",
          dotClass: "bg-emerald-500",
        };

      case "LEFT":
        return {
          label: "LEFT",
          description: "Head turned left",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          iconClass: "bg-amber-100 text-amber-600",
          dotClass: "bg-amber-500",
        };

      case "RIGHT":
        return {
          label: "RIGHT",
          description: "Head turned right",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          iconClass: "bg-amber-100 text-amber-600",
          dotClass: "bg-amber-500",
        };

      case "UP":
        return {
          label: "UP",
          description: "Head tilted upward",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          iconClass: "bg-blue-100 text-blue-600",
          dotClass: "bg-blue-500",
        };

      case "DOWN":
        return {
          label: "DOWN",
          description: "Head tilted downward",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          iconClass: "bg-blue-100 text-blue-600",
          dotClass: "bg-blue-500",
        };

      default:
        return {
          label: "UNKNOWN",
          description: "Head position unavailable",
          className:
            "bg-slate-100 text-slate-600 border-slate-200",
          iconClass: "bg-slate-100 text-slate-500",
          dotClass: "bg-slate-400",
        };
    }
  };

  // ------------------------------------------------------------
  // DERIVED VALUES
  // ------------------------------------------------------------

  const latestBlinkRate = Number(latestData?.blink_rate || 0);
  const latestEyeClosure = Number(latestData?.eye_closure || 0);
  const latestYawnCount = Number(latestData?.yawn_count || 0);

  const latestHeadPose = useMemo(
    () => getHeadPoseStyle(latestData?.head_pose),
    [latestData?.head_pose]
  );

  const cameraStatus = useMemo(() => {
    if (!monitoringRunning) {
      return {
        label: "Monitoring Offline",
        description: "Start a monitoring session to use camera analysis.",
        className:
          "bg-slate-100 text-slate-600 border-slate-200",
        dotClass: "bg-slate-400",
      };
    }

    if (!cameraEnabled) {
      return {
        label: "Camera Off",
        description: "Webcam analysis is currently disabled.",
        className:
          "bg-red-50 text-red-700 border-red-200",
        dotClass: "bg-red-500",
      };
    }

    if (streamError) {
      return {
        label: "Camera Connected",
        description: "Camera is enabled, but the live preview is unavailable.",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
      };
    }

    return {
      label: "Camera Active",
      description: "Facial monitoring is currently running.",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    };
  }, [monitoringRunning, cameraEnabled, streamError]);

  const StatusIcon =
    monitoringRunning && cameraEnabled
      ? CheckCircle2
      : AlertCircle;

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-full bg-[#f5f7fb] p-6 lg:p-8">
        <div className="min-h-[650px] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading Camera Workspace
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Connecting to the webcam monitoring service...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN UI
  // ------------------------------------------------------------

  return (
    <div className="min-h-full bg-[#f5f7fb] text-slate-800 p-5 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="mb-7">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 flex items-center justify-center shrink-0">
                <Camera className="w-7 h-7 text-white" />

                <span
                  className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full border-[3px] border-[#f5f7fb] ${cameraStatus.dotClass}`}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Camera Data
                  </h1>

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${cameraStatus.className}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${cameraStatus.dotClass}`}
                    />
                    {cameraStatus.label}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  Real-time facial, eye and head-activity monitoring.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                <span className="text-xs font-medium text-slate-500">
                  Auto refresh
                </span>
                <span className="text-xs font-bold text-slate-700">
                  10s
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  fetchCameraStatus();
                  fetchCameraData(true);
                }}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-sm font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-red-800">
                Camera monitoring issue
              </p>

              <p className="text-sm text-red-600 mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            PRIMARY WORKSPACE
        ====================================================== */}

        <section className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)] gap-6 mb-7">

          {/* ----------------------------------------------------
              LIVE PREVIEW
          ---------------------------------------------------- */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Live Camera Preview
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Webcam feed used for facial analysis
                  </p>
                </div>
              </div>

              {cameraEnabled && monitoringRunning ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    LIVE
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                  <VideoOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-500">
                    OFFLINE
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-video min-h-[300px] flex items-center justify-center ring-1 ring-slate-900/10">

                {cameraEnabled &&
                monitoringRunning &&
                !streamError ? (
                  <img
                    key={cameraEnabled ? "camera-on" : "camera-off"}
                    src={cameraStreamUrl()}
                    alt="Live camera preview"
                    className="w-full h-full object-contain"
                    onLoad={() => setStreamError(false)}
                    onError={() => setStreamError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                        {monitoringRunning ? (
                          cameraEnabled ? (
                            <WifiOff className="w-7 h-7 text-white/60" />
                          ) : (
                            <VideoOff className="w-7 h-7 text-white/60" />
                          )
                        ) : (
                          <Camera className="w-7 h-7 text-white/60" />
                        )}
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-white">
                        {!monitoringRunning
                          ? "Monitoring is not running"
                          : !cameraEnabled
                          ? "Camera monitoring is off"
                          : "Live preview unavailable"}
                      </h3>

                      <p className="mt-1.5 text-xs text-white/50 max-w-sm">
                        {!monitoringRunning
                          ? "Start a monitoring session to activate the webcam."
                          : !cameraEnabled
                          ? "Turn on camera monitoring from the control panel."
                          : "The camera is enabled, but the video stream could not be loaded."}
                      </p>
                    </div>
                  </div>
                )}

                {cameraEnabled && monitoringRunning && !streamError && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>

                      <span className="text-[10px] font-bold text-white tracking-wider">
                        CAMERA
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-white/80 bg-black/40 px-2.5 py-1.5 rounded-lg backdrop-blur-md">
                        Facial analysis active
                      </span>

                      <span className="text-[10px] text-white/60 bg-black/40 px-2.5 py-1.5 rounded-lg backdrop-blur-md font-semibold">
                        VitaSense
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-slate-500">
                    Camera data is processed for monitoring.
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <LockKeyhole className="w-3.5 h-3.5" />
                  Local monitoring session
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              CONTROL PANEL
          ---------------------------------------------------- */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Webcam Analysis
                  </p>

                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    Camera Control
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">

              {/* MAIN TOGGLE */}

              <div
                className={`rounded-2xl border p-5 transition ${
                  cameraEnabled
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        cameraEnabled
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {cameraEnabled ? (
                        <Camera className="w-5 h-5" />
                      ) : (
                        <VideoOff className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        Camera Monitoring
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {cameraEnabled
                          ? "Facial analysis is active."
                          : "Webcam analysis is currently disabled."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCameraToggle}
                    disabled={cameraToggling || !monitoringRunning}
                    className={`relative inline-flex items-center shrink-0 w-[76px] h-10 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed ${
                      cameraEnabled
                        ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                        : "bg-slate-300"
                    }`}
                    aria-label={
                      cameraEnabled
                        ? "Turn camera off"
                        : "Turn camera on"
                    }
                  >
                    <span
                      className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        cameraEnabled
                          ? "translate-x-[40px]"
                          : "translate-x-1"
                      }`}
                    />

                    <span
                      className={`absolute text-[10px] font-extrabold ${
                        cameraEnabled
                          ? "left-2.5 text-white"
                          : "right-2.5 text-slate-600"
                      }`}
                    >
                      {cameraToggling
                        ? "..."
                        : cameraEnabled
                        ? "ON"
                        : "OFF"}
                    </span>
                  </button>
                </div>
              </div>

              {/* SESSION STATUS */}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Monitoring
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        monitoringRunning
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />

                    <span className="text-sm font-bold text-slate-700">
                      {monitoringRunning ? "Active" : "Stopped"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Camera
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {cameraEnabled ? (
                      <Wifi className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-slate-400" />
                    )}

                    <span className="text-sm font-bold text-slate-700">
                      {cameraEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LATEST READING TIME */}

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Latest Reading
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {latestData
                        ? formatDateTime(latestData.created_at)
                        : "No reading available"}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* WHAT IS MEASURED */}

              <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      What is being monitored?
                    </p>

                    <p className="text-xs text-blue-700 mt-1 leading-5">
                      Blink rate, eye closure, yawning frequency and
                      head orientation are collected to support
                      fatigue analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            LATEST CAMERA READING
        ====================================================== */}

        <section className="mb-7">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Latest Camera Reading
                </h2>

                {latestData && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                    <Circle className="w-1.5 h-1.5 fill-blue-500" />
                    Latest
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 mt-1">
                The most recent measurements captured by the webcam.
              </p>
            </div>

            {latestData && (
              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-4 h-4" />
                Updated {formatTime(latestData.created_at)}
              </div>
            )}
          </div>

          {!latestData ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 sm:p-14 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No Camera Reading Yet
              </h3>

              <p className="mt-2 max-w-md mx-auto text-sm text-slate-500 leading-6">
                {cameraEnabled
                  ? "The camera is enabled. Waiting for the next facial monitoring measurement."
                  : "Enable camera monitoring during an active session to begin collecting facial activity data."}
              </p>

              <button
                type="button"
                onClick={() => {
                  fetchCameraStatus();
                  fetchCameraData(true);
                }}
                disabled={refreshing}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition shadow-sm disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Check Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

              {/* BLINK RATE */}

              <div className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-[80px] opacity-70" />

                <div className="relative flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    EYE
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-500 mt-6">
                  Blink Rate
                </p>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatNumber(latestBlinkRate)}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    blinks/min
                  </span>
                </div>

                <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        latestBlinkRate * 2,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* EYE CLOSURE */}

              <div className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-[80px] opacity-70" />

                <div className="relative flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    EYES
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-500 mt-6">
                  Eye Closure
                </p>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatNumber(latestEyeClosure)}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    %
                  </span>
                </div>

                <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        latestEyeClosure,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* YAWN COUNT */}

              <div className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-[80px] opacity-70" />

                <div className="relative flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Smile className="w-5 h-5 text-amber-600" />
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    FACE
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-500 mt-6">
                  Yawn Count
                </p>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {latestYawnCount}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    yawns
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        item <= Math.min(latestYawnCount, 5)
                          ? "bg-amber-400"
                          : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* HEAD POSE */}

              <div className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] opacity-80" />

                <div className="relative flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${latestHeadPose.iconClass}`}
                  >
                    <Move3D className="w-5 h-5" />
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    HEAD
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-500 mt-6">
                  Head Pose
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold ${latestHeadPose.className}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${latestHeadPose.dotClass}`}
                    />
                    {latestHeadPose.label}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  {latestHeadPose.description}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================
            MONITORING SUMMARY
        ====================================================== */}

        {latestData && (
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-slate-600" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Monitoring Summary
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Camera session information and collection state
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <StatusIcon
                      className={`w-4 h-4 ${
                        monitoringRunning && cameraEnabled
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Session State
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {monitoringRunning ? "Monitoring Active" : "Monitoring Stopped"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Last Captured
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {formatTime(latestData.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Data Capture
                    </p>

                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {cameraEnabled
                        ? "Receiving Live camera data"
                        : "Using last captured reading"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Camera metrics are collected for fatigue-analysis support.
              </div>

              <span className="text-xs text-slate-400">
                {formatDateTime(latestData.created_at)}
              </span>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default CameraData;

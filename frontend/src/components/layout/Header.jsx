import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  BrainCircuit,
  Clock3,
  Play,
  Square,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MonitoringTransition from "../common/MonitoringTransition";
import ProfileMenu from "../common/ProfileMenu";
import { getUnreadNotifications } from "../../api/notificationApi";

import {
  startMonitoring,
  stopMonitoring,
  getMonitoringStatus,
  getCurrentMonitoring,
  getMonitoringData,
  getCurrentPrediction,
  getCurrentRecommendations,
  getMonitoringTransitionStatus,
} from "../../api/monitoringApi";

// ==========================================================
// HELPERS
// ==========================================================

const normalizeMode = (value) => {
  if (!value) return null;

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[- ]/g, "_");

  if (normalized === "AI_MONITORING") return "AI_MONITORING";
  if (normalized === "DATA_COLLECTION") return "DATA_COLLECTION";

  return null;
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getStoredUserId = () => {
  const user = getStoredUser();
  return user?.id ?? localStorage.getItem("user_id") ?? null;
};

const INITIAL_START_STEPS = [
  { id: "desktop", label: "Desktop activity monitoring", status: "pending" },
  { id: "iot", label: "IoT monitoring", status: "pending" },
  { id: "camera_ai", label: "Camera and AI processing", status: "pending" },
  { id: "session", label: "Monitoring session", status: "pending" },
];

const INITIAL_STOP_STEPS = [
  { id: "save_data", label: "Saving final monitoring data", status: "pending" },
  { id: "stop_camera_ai", label: "Stopping camera and AI processing", status: "pending" },
  { id: "stop_desktop", label: "Stopping desktop monitoring", status: "pending" },
  { id: "stop_iot", label: "Stopping IoT monitoring", status: "pending" },
  { id: "close_session", label: "Closing monitoring session", status: "pending" },
];


// ==========================================================
// HEADER
// ==========================================================

const Header = () => {
  const transitionPollRef = useRef(null);
const transitionPollBusyRef = useRef(false);
  const navigate = useNavigate();

  // ========================================================
  // STATE
  // ========================================================

  const [currentTime, setCurrentTime] = useState(new Date());

  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
  });

  const [mode, setMode] = useState(() =>
    normalizeMode(localStorage.getItem("selectedMode"))
  );

  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lastSessionId, setLastSessionId] = useState(() => {
    const saved = localStorage.getItem("lastSessionId");
    return saved ? Number(saved) : null;
  });

  const [busy, setBusy] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // phase: "idle" | "starting" | "stopping" | "started_success" | "stopped_success"
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [progressSteps, setProgressSteps] = useState([]);
  const [statusBannerMessage, setStatusBannerMessage] = useState("");

  const operationInProgress = useRef(false);
  const bannerTimeoutRef = useRef(null);
  // Convert backend transition data into the format used by the modal.
  const syncTransitionProgress = useCallback(
    async (stepDefinitions) => {
      if (transitionPollBusyRef.current) return;

      transitionPollBusyRef.current = true;

      try {
        const response = await getMonitoringTransitionStatus();
        const backendSteps = response?.data?.steps || {};

        setProgressSteps(
          stepDefinitions.map((step) => {
            const backendStep = backendSteps[step.id];

            // New backend format:
            // { status: "completed", message: "..." }
            const status =
              typeof backendStep === "object" && backendStep !== null
                ? backendStep.status
                : backendStep === true
                  ? "completed"
                  : "pending";

            const message =
              typeof backendStep === "object" && backendStep !== null
                ? backendStep.message || ""
                : "";

            return {
              ...step,
              status: [
                "pending",
                "in_progress",
                "completed",
                "skipped",
                "error",
              ].includes(status)
                ? status
                : "pending",
              message,
            };
          })
        );
      } catch (error) {
        console.warn(
          "Could not retrieve monitoring transition progress:",
          error.response?.data || error.message
        );
      } finally {
        transitionPollBusyRef.current = false;
      }
    },
    []
  );

  // Start polling the backend while a start/stop request is executing.
  const startTransitionPolling = useCallback(
    (stepDefinitions) => {
      if (transitionPollRef.current) {
        clearInterval(transitionPollRef.current);
      }

      syncTransitionProgress(stepDefinitions);

      transitionPollRef.current = setInterval(() => {
        syncTransitionProgress(stepDefinitions);
      }, 500);

      return async () => {
        if (transitionPollRef.current) {
          clearInterval(transitionPollRef.current);
          transitionPollRef.current = null;
        }

        // Get one final backend update before closing the progress modal.
        await syncTransitionProgress(stepDefinitions);
      };
    },
    [syncTransitionProgress]
  );

  const clearBannerTimeout = () => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = null;
    }
  };

  const showBriefSuccess = useCallback((phase, message, durationMs = 3500) => {
    clearBannerTimeout();
    setProgressSteps([]);
    setTransitionPhase(phase);
    setStatusBannerMessage(message);

    bannerTimeoutRef.current = setTimeout(() => {
      setTransitionPhase("idle");
      setStatusBannerMessage("");
    }, durationMs);
  }, []);

  const dismissBanner = () => {
    clearBannerTimeout();
    setTransitionPhase("idle");
    setStatusBannerMessage("");
    setProgressSteps([]);
  };

  useEffect(() => {
    return () => {
      clearBannerTimeout();

      if (transitionPollRef.current) {
        clearInterval(transitionPollRef.current);
      }
    };
  }, []);

  // ========================================================
  // USER
  // ========================================================

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser({
        id: storedUser.id ?? null,
        name: storedUser.name ?? "",
        email: storedUser.email ?? "",
      });
    }
  }, []);

  // ========================================================
  // RESTORE MONITORING STATUS
  // ========================================================

  useEffect(() => {
    if (!user.id) return;

    let mounted = true;

    const refreshStatus = async () => {
      if (operationInProgress.current) return;

      try {
        const { data } = await getMonitoringStatus(user.id);

        if (!mounted) return;

        const running = Boolean(data?.running);
        const activeSessionId = data?.session_id ?? null;

        setIsRunning(running);
        setSessionId(running ? activeSessionId : null);

        if (activeSessionId) {
          setLastSessionId(Number(activeSessionId));
          localStorage.setItem("lastSessionId", String(activeSessionId));
        }

        const backendMode = normalizeMode(data?.mode);

        if (backendMode) {
          setMode(backendMode);
          localStorage.setItem("selectedMode", backendMode);
        } else {
          setMode(normalizeMode(localStorage.getItem("selectedMode")));
        }
      } catch (error) {
        console.warn(
          "Could not restore monitoring status:",
          error.response?.data || error.message
        );
      }
    };

    refreshStatus();

    const timer = setInterval(refreshStatus, 15000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [user.id]);

  // ========================================================
  // START MONITORING (ONE STEP IN PROGRESS AT A TIME)
  // ========================================================
  const handleStart = async () => {
    const userId = user.id || getStoredUserId();

    const selectedMode = normalizeMode(
      mode || localStorage.getItem("selectedMode")
    );

    if (!userId) {
      console.error("Cannot start monitoring: missing user ID.");
      return;
    }

    if (!selectedMode) {
      console.error("Please select a monitoring mode.");
      return;
    }

    if (operationInProgress.current || isRunning) return;

    clearBannerTimeout();

    operationInProgress.current = true;
    setBusy(true);

    setTransitionPhase("starting");
    setStatusBannerMessage("");

    setProgressSteps(INITIAL_START_STEPS.map((step) => ({
      ...step,
      status: "pending",
      message: "",
    })));

    const stopPolling = startTransitionPolling(INITIAL_START_STEPS);

    try {
      setMode(selectedMode);
      localStorage.setItem("selectedMode", selectedMode);

      console.time("VitaSense Start Monitoring");

      const { data } = await startMonitoring(userId, selectedMode);

      console.timeEnd("VitaSense Start Monitoring");

      if (data?.success === false) {
        throw new Error(
          data?.message || "Monitoring could not start."
        );
      }

      // Get the latest actual backend progress.
      await syncTransitionProgress(INITIAL_START_STEPS);

      let currentPayload = null;

      try {
        const currentRes = await getCurrentMonitoring(userId);
        currentPayload = currentRes?.data ?? null;
      } catch {
        // The start response remains the fallback.
      }

      let newSessionId =
        data?.session_id ?? currentPayload?.session_id ?? null;

      let confirmedRunning = data?.running !== false;

      try {
        const statusRes = await getMonitoringStatus(userId);
        const statusData = statusRes?.data ?? {};

        if (typeof statusData.running === "boolean") {
          confirmedRunning = statusData.running;
        }

        if (statusData.session_id) {
          newSessionId = statusData.session_id;
        }
      } catch {
        // Use the start response if status retrieval fails.
      }

      if (!confirmedRunning) {
        throw new Error(
          "Monitoring did not remain active after starting."
        );
      }

      setIsRunning(true);
      setSessionId(newSessionId);

      if (newSessionId) {
        setLastSessionId(Number(newSessionId));

        localStorage.setItem(
          "lastSessionId",
          String(newSessionId)
        );
      }

      console.log("Monitoring started:", {
        userId,
        mode: selectedMode,
        sessionId: newSessionId,
      });

      showBriefSuccess(
        "started_success",
        "VitaSense monitoring has started successfully."
      );
    } catch (error) {
      setTransitionPhase("idle");
      setProgressSteps([]);

      console.error(
        "Start Monitoring Error:",
        error.response?.data || error.message
      );

      window.alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to start monitoring."
      );
    } finally {
      await stopPolling();

      operationInProgress.current = false;
      setBusy(false);
    }
  };

  // ========================================================
  // PRESERVE FINAL DATA
  // ========================================================

  const preserveFinalData = useCallback(
    async (userId, finalSessionId, monitoringMode, results) => {
      const [monitoringResult, predictionResult, recommendationResult] =
        results;

      if (monitoringResult?.status === "fulfilled") {
        const data = monitoringResult.value?.data;

        if (data?.success) {
          const records = data.data || [];

          if (finalSessionId) {
            localStorage.setItem(
              `dashboardCache_${userId}_${finalSessionId}`,
              JSON.stringify(records)
            );

            window.dispatchEvent(
              new CustomEvent("monitoring:final-data", {
                detail: {
                  sessionId: finalSessionId,
                  records,
                },
              })
            );
          }
        }
      } else if (monitoringResult?.status === "rejected") {
        console.warn(
          "Could not preserve final monitoring data:",
          monitoringResult.reason
        );
      }

      if (monitoringMode === "AI_MONITORING") {
        if (predictionResult?.status === "fulfilled") {
          const data = predictionResult.value?.data;

          if (data?.has_prediction && data?.prediction) {
            localStorage.setItem(
              "lastAIPrediction",
              JSON.stringify(data.prediction)
            );
          }
        }

        if (recommendationResult?.status === "fulfilled") {
          const data = recommendationResult.value?.data;

          if (data?.has_recommendations) {
            localStorage.setItem(
              "lastAIRecommendations",
              JSON.stringify(data.recommendations || [])
            );
          }
        }
      }

      console.log("Final monitoring data preservation completed.");
    },
    []
  );

  // ========================================================
  // STOP MONITORING (ONE STEP IN PROGRESS AT A TIME)
  // ========================================================
const handleStop = async () => {
  if (operationInProgress.current || !isRunning) return;

  const userId = user.id || getStoredUserId();
  const finalSessionId = sessionId || lastSessionId;
  const monitoringMode = normalizeMode(mode);

  clearBannerTimeout();

  operationInProgress.current = true;
  setBusy(true);

  setTransitionPhase("stopping");
  setStatusBannerMessage("");

  setProgressSteps(INITIAL_STOP_STEPS.map((step) => ({
    ...step,
    status: "pending",
    message: "",
  })));

  const stopPolling = startTransitionPolling(INITIAL_STOP_STEPS);

  try {
    console.time("VitaSense Stop Monitoring");

    // Preserve the final data before stopping the backend.
    const preservationRequests = [
      finalSessionId
        ? getMonitoringData(userId, finalSessionId)
        : Promise.resolve(null),

      monitoringMode === "AI_MONITORING"
        ? getCurrentPrediction(userId)
        : Promise.resolve(null),

      monitoringMode === "AI_MONITORING"
        ? getCurrentRecommendations(userId)
        : Promise.resolve(null),
    ];

    const results = await Promise.allSettled(
      preservationRequests
    );

    await preserveFinalData(
      userId,
      finalSessionId,
      monitoringMode,
      results
    );

    // The backend now controls the actual shutdown progress.
    const { data } = await stopMonitoring();

    if (data?.success === false) {
      throw new Error(
        data?.message || "Monitoring could not stop."
      );
    }

    await syncTransitionProgress(INITIAL_STOP_STEPS);

    // Confirm the backend is no longer running.
    const statusRes = await getMonitoringStatus(userId);

    if (statusRes?.data?.running === true) {
      throw new Error(
        "The backend still reports that monitoring is active."
      );
    }

    console.timeEnd("VitaSense Stop Monitoring");

    setIsRunning(false);
    setSessionId(null);

    console.log("Monitoring stopped successfully.");

    showBriefSuccess(
      "stopped_success",
      "Monitoring stopped successfully. Your session data has been saved."
    );
  } catch (error) {
    console.error(
      "Stop Monitoring Error:",
      error.response?.data || error.message
    );

    setTransitionPhase("idle");
    setProgressSteps([]);

    window.alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to stop monitoring."
    );

    // Refresh the real monitoring state after a failed stop.
    try {
      const statusRes = await getMonitoringStatus(userId);

      setIsRunning(Boolean(statusRes?.data?.running));
      setSessionId(statusRes?.data?.session_id ?? null);
    } catch {
      console.warn("Could not refresh monitoring status.");
    }
  } finally {
    await stopPolling();

    operationInProgress.current = false;
    setBusy(false);
  }
};
  // ========================================================
  // CLOCK
  // ========================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ========================================================
  // AI MONITORING CHECK
  // ========================================================

  const isAIMonitoring = normalizeMode(mode) === "AI_MONITORING";

  // ========================================================
  // LOAD UNREAD NOTIFICATIONS
  // ========================================================

  const loadUnreadNotifications = useCallback(async () => {
    if (!user.id || !isAIMonitoring) return;

    try {
      const response = await getUnreadNotifications(user.id);

      if (response.data?.success) {
        setUnreadCount(response.data.unread_count ?? 0);
      }
    } catch (error) {
      console.error(
        "Failed to load unread notifications:",
        error.response?.data || error.message
      );
    }
  }, [user.id, isAIMonitoring]);

  useEffect(() => {
    if (!isAIMonitoring) {
      setUnreadCount(0);
      return;
    }

    loadUnreadNotifications();

    const timer = setInterval(() => {
      loadUnreadNotifications();
    }, 10000);

    return () => clearInterval(timer);
  }, [isAIMonitoring, loadUnreadNotifications]);

  // ========================================================
  // NOTIFICATION CLICK
  // ========================================================

  const handleNotificationClick = () => {
    if (isAIMonitoring) {
      navigate("/notifications");
    }
  };

  // ========================================================
  // DISPLAY VALUES
  // ========================================================

  const displayName = user?.name || "User";
  const accountId = user?.id
    ? `USR-${String(user.id).padStart(4, "0")}`
    : "USR-0000";



  return (
    <>
      <header
        className="
          w-full
          h-[84px]
          flex
          items-center
          justify-between
          px-8
          bg-white
          border-b
          border-gray-200
          shadow-sm
          shrink-0
        "
      >
        {/* LEFT SECTION */}

        <div className="shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">
            VITASENSE
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {displayName}
          </p>
        </div>

        {/* RIGHT SECTION */}

        <div className="flex items-center gap-3">
          {/* MONITORING STATUS */}

          <div
            className={`
              hidden xl:flex items-center gap-2
              px-3.5 py-2 rounded-xl border
              ${isRunning
                ? "bg-green-50 border-green-200"
                : "bg-slate-50 border-slate-200"
              }
            `}
          >
            <span
              className={`
                h-2.5 w-2.5 rounded-full
                ${isRunning
                  ? "bg-green-500 animate-pulse"
                  : "bg-slate-400"
                }
              `}
            />

            <BrainCircuit
              size={17}
              className={
                isRunning ? "text-green-600" : "text-slate-400"
              }
            />

            <span
              className={`
                text-sm font-medium
                ${isRunning
                  ? "text-emerald-600"
                  : "text-slate-500"
                }
              `}
            >
              {isRunning ? "Monitoring Active" : "Monitoring Inactive"}
            </span>
          </div>

          {/* MONITORING CONTROL */}

          <button
            type="button"
            onClick={isRunning ? handleStop : handleStart}
            disabled={busy || (!isRunning && !mode)}
            className={`
              flex items-center gap-2
              rounded-xl px-4 py-2.5
              text-sm font-semibold text-white
              shadow-sm transition-all
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${isRunning
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {isRunning ? (
              <Square size={16} />
            ) : (
              <Play size={16} />
            )}

            {busy
              ? "Please wait..."
              : isRunning
                ? "Stop Monitoring"
                : "Start Monitoring"}
          </button>

          {/* CURRENT TIME */}

          <div
            className="
              hidden md:flex
              items-center
              gap-2
              text-gray-600
              px-1
            "
          >
            <Clock3 size={17} className="text-blue-500" />

            <span className="text-sm whitespace-nowrap">
              {currentTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          {/* NOTIFICATION BELL */}

          {isAIMonitoring && (
            <button
              type="button"
              onClick={handleNotificationClick}
              aria-label={
                unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "Notifications"
              }
              title="Notifications"
              className="
                relative
                p-2.5
                rounded-xl
                bg-white
                border
                border-gray-200
                hover:bg-gray-100
                hover:border-gray-300
                shadow-sm
                transition-all
                duration-200
                cursor-pointer
              "
            >
              <Bell
                size={19}
                className={
                  unreadCount > 0
                    ? "text-gray-800"
                    : "text-gray-600"
                }
              />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    min-w-[20px]
                    h-5
                    px-1
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    text-white
                    text-[11px]
                    font-bold
                    border-2
                    border-white
                  "
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* PROFILE */}

          <ProfileMenu
            user={{
              ...user,
              accountId,
            }}
          />
        </div>
      </header>

      {/* MONITORING TRANSITION */}

      <MonitoringTransition
        transitionPhase={transitionPhase}
        progressSteps={progressSteps}
        statusBannerMessage={statusBannerMessage}
        onDismiss={dismissBanner}
      />
    </>
  );
};

export default Header;
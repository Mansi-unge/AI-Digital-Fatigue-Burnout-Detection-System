
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import MetricCard from "../../components/dashboard/MetricCard";
import ActivityChart from "../../components/dashboard/ActivityChart";
import ApplicationPieChart from "../../components/dashboard/ApplicationPieChart";
import KeyboardMouseChart from "../../components/dashboard/KeyboardMouseChart";
import OverviewBanner from "../../components/dashboard/OverviewBanner";
import EnvironmentCard from "../../components/dashboard/EnvironmentCard";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import CameraAttentionCard from "../../components/dashboard/CameraAttentionCard";
import DeviceStatusCard from "../../components/dashboard/DeviceStatusCard";


import {
  getCurrentMonitoring,
  getMonitoringStatus,
  getMonitoringData,
  getDataCollectionProgress,
  saveFatigueReport,
  getLatestFatigue,
  getCurrentPrediction,
  getCurrentRecommendations,
} from "../../api/monitoringApi";

import { secondsToHm } from "../../utils/format";

import {
  Clock3,
  Activity,
  Coffee,
  Keyboard,
  Mouse,
  Repeat2,
  BrainCircuit,
  X,
  CheckCircle2,
} from "lucide-react";

// ==========================================================
// REFRESH CONFIGURATION
// ==========================================================

const POLL_MS = 8000;
const HISTORY_REFRESH_MS = 60000;
const SESSION_REFRESH_MS = 60000;
const PROGRESS_REFRESH_MS = 30000;
const FATIGUE_REFRESH_MS = 30000;
const AI_REFRESH_MS = 15000;

// ==========================================================
// CACHE HELPERS
// ==========================================================

const readActivityCache = (userId, sessionId) => {
  if (!userId || !sessionId) return [];

  try {
    const cached = localStorage.getItem(
      `dashboardCache_${userId}_${sessionId}`
    );

    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error("Dashboard cache read failed:", error);
    return [];
  }
};

const saveActivityCache = (userId, sessionId, records) => {
  if (!userId || !sessionId) return;

  try {
    localStorage.setItem(
      `dashboardCache_${userId}_${sessionId}`,
      JSON.stringify(records)
    );
  } catch (error) {
    console.warn("Dashboard cache save failed:", error);
  }
};

// ==========================================================
// USER HELPER
// ==========================================================

const getStoredUser = () => {
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    return (
      storedUser || {
        id: localStorage.getItem("user_id"),
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
      }
    );
  } catch (error) {
    console.error("Failed to read stored user:", error);

    return {
      id: localStorage.getItem("user_id"),
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
    };
  }
};

// ==========================================================
// DASHBOARD COMPONENT
// ==========================================================

const Dashboard = () => {

  // ========================================================
  // USER
  // ========================================================

  const user = getStoredUser();

  const userId =
    user?.id ??
    localStorage.getItem("user_id") ??
    null;

  // ========================================================
  // MONITORING CONTEXT
  // ========================================================

  // ========================================================
  // MONITORING STATE (API BASED - NO CONTEXT)
  // ========================================================

  const [mode, setMode] = useState("DATA_COLLECTION");

  const [isRunning, setIsRunning] = useState(false);

  const [sessionId, setSessionId] = useState(null);

  const [lastSessionId, setLastSessionId] = useState(null);

  const effectiveSessionId = sessionId || lastSessionId;

  const isAI =
    mode === "AI_MONITORING" ||
    mode === "ai_monitoring";

  // ========================================================
  // INITIAL CACHED ACTIVITY
  // ========================================================

  const [activityHistory, setActivityHistory] = useState(
    () => readActivityCache(userId, effectiveSessionId)
  );

  const [activityRecords, setActivityRecords] = useState(
    () => readActivityCache(userId, effectiveSessionId)
  );

  const [latest, setLatest] = useState(
    () => readActivityCache(userId, effectiveSessionId)[0] || null
  );

  const [previous, setPrevious] = useState(
    () => readActivityCache(userId, effectiveSessionId)[1] || null
  );

  const [older, setOlder] = useState(
    () => readActivityCache(userId, effectiveSessionId)[2] || null
  );

  // ========================================================
  // OTHER ACTIVITY DATA
  // ========================================================

  const [keyboardMouseHistory, setKeyboardMouseHistory] =
    useState([]);

  const [desktopActivityHistory, setDesktopActivityHistory] =
    useState([]);

  // ========================================================
  // AI DATA
  // ========================================================

  const [fatigueResponse, setFatigueResponse] = useState(null);

  const [prediction, setPrediction] = useState(null);

  const [recommendations, setRecommendations] = useState([]);

  const [lastAIPrediction, setLastAIPrediction] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("lastAIPrediction") || "null"
      );
    } catch {
      return null;
    }
  });

  const [lastAIRecommendations, setLastAIRecommendations] = useState(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem("lastAIRecommendations") || "[]"
        );
      } catch {
        return [];
      }
    }
  );

  // ========================================================
  // OTHER DASHBOARD STATE
  // ========================================================

  const [recordCount, setRecordCount] = useState(0);

  const [lastSyncAt, setLastSyncAt] = useState(null);

  const [loading, setLoading] = useState(
    () => readActivityCache(userId, effectiveSessionId).length === 0
  );

  const [toast, setToast] = useState(null);

  const toastTimeoutRef = useRef(null);
  // ========================================================
  // TOAST NOTIFICATIONS
  // ========================================================

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);
  // ========================================================
  // FETCH MONITORING STATUS FROM BACKEND
  // ========================================================

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchMonitoringState = async () => {
      try {
        const [statusResponse, currentResponse] = await Promise.all([
          getMonitoringStatus(userId),
          getCurrentMonitoring(userId),
        ]);

        if (cancelled) return;

        const status = statusResponse?.data || {};
        const currentData = currentResponse?.data || {};

        const currentSession =
          currentData.has_active_session === true
            ? currentData.session
            : null;

        // The status endpoint reports the actual monitor-manager state.
        // Also verify that the running monitor belongs to this user.
        const active =
          status.success === true &&
          status.running === true &&
          String(status.user_id) === String(userId);

        const currentMode =
          (active ? status.mode : null) ||
          currentSession?.mode ||
          localStorage.getItem("monitoring_mode") ||
          "DATA_COLLECTION";

        setMode(currentMode);

        localStorage.setItem("monitoring_mode", currentMode);

        setIsRunning(active);

        const activeSessionId = active
          ? status.session_id
          : null;

        if (activeSessionId) {
          setSessionId(activeSessionId);
          setLastSessionId(activeSessionId);

          localStorage.setItem(
            "last_session_id",
            String(activeSessionId)
          );
        } else {
          setSessionId(null);

          const previousSessionId =
            localStorage.getItem("last_session_id");

          setLastSessionId(previousSessionId || null);
        }

        if (active && currentSession?.last_sync_at) {
          setLastSyncAt(currentSession.last_sync_at);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to fetch monitoring state:",
            error?.response?.data || error
          );
        }
      }
    };

    fetchMonitoringState();

    const interval = setInterval(fetchMonitoringState, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);
  // ========================================================
  // REFRESH CONTROL
  // ========================================================

  const refreshInProgressRef = useRef(false);

  const lastHistoryFetchRef = useRef(0);

  const lastSessionFetchRef = useRef(0);

  const lastProgressFetchRef = useRef(0);

  const lastFatigueFetchRef = useRef(0);

  const lastAIRefreshRef = useRef(0);

  const lastFetchedSessionRef = useRef(null);

  const lastSessionIdRef = useRef(null);

  // ========================================================
  // RESTORE CACHE WHEN SESSION CHANGES
  // ========================================================

  useEffect(() => {
    const cachedRecords = readActivityCache(
      userId,
      effectiveSessionId
    );

    setActivityHistory(cachedRecords);
    setActivityRecords(cachedRecords);

    setLatest(cachedRecords[0] || null);
    setPrevious(cachedRecords[1] || null);
    setOlder(cachedRecords[2] || null);

    setLoading(cachedRecords.length === 0);

    // New session must be fetched once.
    lastFetchedSessionRef.current = null;

  }, [userId, effectiveSessionId]);

  // ========================================================
  // RECEIVE FINAL DATA WHEN MONITORING STOPS
  // ========================================================

  useEffect(() => {
    const handleFinalData = (event) => {
      const {
        sessionId: stoppedSessionId,
        records,
      } = event.detail || {};

      if (
        String(stoppedSessionId) !== String(effectiveSessionId)
      ) {
        return;
      }

      const safeRecords = records || [];

      setActivityHistory(safeRecords);
      setActivityRecords(safeRecords);

      setLatest(safeRecords[0] || null);
      setPrevious(safeRecords[1] || null);
      setOlder(safeRecords[2] || null);

      saveActivityCache(
        userId,
        stoppedSessionId,
        safeRecords
      );

      lastFetchedSessionRef.current =
        String(stoppedSessionId);

      setLastSyncAt(new Date().toISOString());
      setLoading(false);
    };

    window.addEventListener(
      "monitoring:final-data",
      handleFinalData
    );

    return () => {
      window.removeEventListener(
        "monitoring:final-data",
        handleFinalData
      );
    };
  }, [effectiveSessionId, userId]);

  // ========================================================
  // FETCH DASHBOARD DATA
  // ========================================================

  const refresh = useCallback(async () => {

    if (!userId) {
      setError("No user_id found — please log in.");
      setLoading(false);
      return;
    }

    // Prevent overlapping refresh cycles.
    if (refreshInProgressRef.current) return;

    refreshInProgressRef.current = true;

    const now = Date.now();

    const sessionKey = effectiveSessionId
      ? String(effectiveSessionId)
      : null;

    const sessionChanged =
      sessionKey !== lastSessionIdRef.current;

    const shouldFetchActivity =
      Boolean(sessionKey) &&
      (
        isRunning ||
        lastFetchedSessionRef.current !== sessionKey
      );

    const shouldFetchSession =
      Boolean(sessionId) &&
      (
        sessionChanged ||
        now - lastSessionFetchRef.current >= SESSION_REFRESH_MS
      );
    const shouldFetchHistory =
      now - lastHistoryFetchRef.current >= HISTORY_REFRESH_MS;

    const shouldFetchProgress =
      !isAI &&
      now - lastProgressFetchRef.current >= PROGRESS_REFRESH_MS;

    const shouldFetchFatigue =
      !isAI &&
      now - lastFatigueFetchRef.current >= FATIGUE_REFRESH_MS;

    const shouldFetchAI =
      isAI &&
      now - lastAIRefreshRef.current >= AI_REFRESH_MS;

    try {

      const requests = [];

      // ----------------------------------------------------
      // CURRENT SESSION ACTIVITY
      // ----------------------------------------------------

      if (shouldFetchActivity) {

        requests.push(
          getMonitoringData(userId, effectiveSessionId)
            .then(({ data }) => {

              if (!data?.success) return;

              const records = data.data || [];

              setActivityHistory(records);
              setActivityRecords(records);

              setLatest(records[0] || null);
              setPrevious(records[1] || null);
              setOlder(records[2] || null);

              saveActivityCache(
                userId,
                effectiveSessionId,
                records
              );

              lastFetchedSessionRef.current = sessionKey;

              setLoading(false);
            })
        );
      }

      // ----------------------------------------------------
      // HISTORICAL CHART DATA
      // ----------------------------------------------------

      if (shouldFetchHistory) {

        requests.push(
          getMonitoringData(userId)
            .then(({ data }) => {

              if (!data?.success) return;

              const records = data.data || [];

              setKeyboardMouseHistory(records);
              setDesktopActivityHistory(records);

              lastHistoryFetchRef.current = Date.now();
            })
        );
      }

      // ----------------------------------------------------
      // SESSION METADATA
      // ----------------------------------------------------

      if (shouldFetchSession) {

        requests.push(
          getCurrentMonitoring(userId)
            .then(({ data }) => {

              const currentSession =
                data?.success &&
                  data?.has_active_session &&
                  data?.session
                  ? data.session
                  : null;

              if (currentSession?.last_sync_at) {
                setLastSyncAt(currentSession.last_sync_at);
              }

              lastSessionFetchRef.current = Date.now();
              lastSessionIdRef.current = sessionKey;
            })
        );
      }

      // ----------------------------------------------------
      // DATA COLLECTION
      // ----------------------------------------------------

      if (!isAI) {

        if (shouldFetchFatigue) {

          requests.push(
            getLatestFatigue(userId)
              .then(({ data }) => {

                if (data?.success) {
                  setFatigueResponse(data.level);
                }

                lastFatigueFetchRef.current = Date.now();
              })
          );
        }

        if (shouldFetchProgress) {

          requests.push(
            getDataCollectionProgress(userId)
              .then(({ data }) => {

                if (data?.success) {
                  setRecordCount(data.record_count);
                }

                lastProgressFetchRef.current = Date.now();
              })
          );
        }
      }

      // ----------------------------------------------------
      // AI MONITORING
      // ----------------------------------------------------

      if (isAI && shouldFetchAI) {

        requests.push(
          getCurrentPrediction(userId)
            .then(({ data }) => {

              if (
                data?.success &&
                data?.has_prediction &&
                data?.prediction
              ) {

                setPrediction(data.prediction);
                setLastAIPrediction(data.prediction);

                localStorage.setItem(
                  "lastAIPrediction",
                  JSON.stringify(data.prediction)
                );
              }
            })
        );

        requests.push(
          getCurrentRecommendations(userId)
            .then(({ data }) => {

              if (!data?.success) return;

              const currentRecommendations =
                data.has_recommendations
                  ? data.recommendations || []
                  : [];

              setRecommendations(currentRecommendations);

              if (currentRecommendations.length > 0) {

                setLastAIRecommendations(
                  currentRecommendations
                );

                localStorage.setItem(
                  "lastAIRecommendations",
                  JSON.stringify(currentRecommendations)
                );
              }

            })
        );

        lastAIRefreshRef.current = now;
      }

      // ----------------------------------------------------
      // EXECUTE REQUESTS IN PARALLEL
      // ----------------------------------------------------

      const results = await Promise.allSettled(requests);

      const failedRequest = results.find(
        (result) => result.status === "rejected"
      );

      if (failedRequest) {

        console.error(
          "Dashboard refresh failed:",
          failedRequest.reason?.response?.data ||
          failedRequest.reason
        );

        // Keep already loaded information.
        console.error(
          "Dashboard API request failed:",
          failedRequest.reason
        );

        showToast(
          "Unable to refresh some dashboard data. Please try again.",
          "error"
        );

      }

      // Remember the session even when monitoring has stopped.
      if (sessionKey) {
        lastSessionIdRef.current = sessionKey;
      }

    } catch (err) {

      console.error(
        "Dashboard refresh error:",
        err?.response?.data || err
      );

      showToast(
        "Unable to load monitoring data. Please try again.",
        "error"
      );

    } finally {

      setLoading(false);
      refreshInProgressRef.current = false;
    }

  }, [
    userId,
    effectiveSessionId,
    sessionId,
    isRunning,
    isAI,
    showToast,
  ]);

  // ========================================================
  // AUTOMATIC BACKGROUND REFRESH
  // ========================================================

  useEffect(() => {

    refresh();

    const interval = setInterval(
      refresh,
      POLL_MS
    );

    return () => clearInterval(interval);

  }, [refresh]);

  // ========================================================
  // FATIGUE SELF-REPORT
  // ========================================================

  const handleFatigueSubmit = async (level) => {

    try {

      await saveFatigueReport(userId, level);

      setFatigueResponse(level);

    } catch (err) {
      console.error("Fatigue report submission failed:", err);

      showToast(
        "Unable to save your fatigue report. Please try again.",
        "error"
      );
    }
  };

  // ========================================================
  // AI DISPLAY DATA
  // ========================================================

  const displayPrediction =
    prediction || lastAIPrediction;

  const displayRecommendations =
    recommendations.length > 0
      ? recommendations
      : lastAIRecommendations;

  const aiStatus = isAI
    ? displayPrediction?.fatigue?.level || "No prediction"
    : null;

  const burnoutRisk = isAI
    ? displayPrediction?.burnout?.level || "No prediction"
    : null;

  const healthScore = isAI
    ? displayPrediction?.health?.score ?? null
    : null;

  const healthLevel = isAI
    ? displayPrediction?.health?.level || "No prediction"
    : null;

  const fatigueScore = isAI
    ? displayPrediction?.fatigue?.score ?? null
    : null;

  const burnoutScore = isAI
    ? displayPrediction?.burnout?.score ?? null
    : null;

  // ========================================================
  // METRIC TREND
  // ========================================================

  const calculateTrend = (
    latestValue,
    previousValue,
    olderValue
  ) => {

    if (
      latestValue == null ||
      previousValue == null ||
      olderValue == null
    ) {
      return "0%";
    }

    const latestNumber = Number(latestValue);
    const previousNumber = Number(previousValue);
    const olderNumber = Number(olderValue);

    if (
      !Number.isFinite(latestNumber) ||
      !Number.isFinite(previousNumber) ||
      !Number.isFinite(olderNumber)
    ) {
      return "0%";
    }

    const currentInterval =
      latestNumber - previousNumber;

    const previousInterval =
      previousNumber - olderNumber;

    if (previousInterval === 0) {

      if (currentInterval === 0) return "0%";

      return currentInterval > 0 ? "+100%" : "-100%";
    }

    const change =
      (
        (currentInterval - previousInterval) /
        Math.abs(previousInterval)
      ) * 100;

    if (Math.abs(change) < 0.1) return "0%";

    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  // ========================================================
  // METRIC STATUS
  // ========================================================

  const getMetricStatus = (
    metric,
    value,
    context = {}
  ) => {

    if (value === null || value === undefined) {
      return "Loading";
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "Loading";
    }

    switch (metric) {

      case "screen": {
        const hours = numericValue / 3600;

        if (hours <= 4) return "Healthy";
        if (hours <= 6) return "Warning";

        return "Critical";
      }

      case "active": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return "Normal";

        const percentage = (numericValue / screenTime) * 100;

        if (percentage >= 60) return "Healthy";
        if (percentage >= 40) return "Warning";

        return "Critical";
      }

      case "idle": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return "Normal";

        const percentage = (numericValue / screenTime) * 100;

        if (percentage <= 30) return "Healthy";
        if (percentage <= 50) return "Warning";

        return "Critical";
      }

      case "keyboard": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return "Normal";

        const perHour = numericValue / (screenTime / 3600);

        if (perHour <= 3000) return "Healthy";
        if (perHour <= 5000) return "Warning";

        return "Critical";
      }

      case "mouse": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return "Normal";

        const perHour = numericValue / (screenTime / 3600);

        if (perHour <= 600) return "Healthy";
        if (perHour <= 1000) return "Warning";

        return "Critical";
      }

      case "applications": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return "Normal";

        const perHour = numericValue / (screenTime / 3600);

        if (perHour <= 20) return "Healthy";
        if (perHour <= 40) return "Warning";

        return "Critical";
      }

      default:
        return "Normal";
    }
  };

  // ========================================================
  // METRIC PROGRESS
  // ========================================================

  const getMetricProgress = (
    metric,
    value,
    context = {}
  ) => {

    if (value === null || value === undefined) return 0;

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return 0;

    switch (metric) {

      case "screen":
        return Math.min(100, (numericValue / 28800) * 100);

      case "active":
      case "idle": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return 0;

        return Math.min(
          100,
          (numericValue / screenTime) * 100
        );
      }

      case "keyboard": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return 0;

        const perHour = numericValue / (screenTime / 3600);

        return Math.min(100, (perHour / 3000) * 100);
      }

      case "mouse": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return 0;

        const perHour = numericValue / (screenTime / 3600);

        return Math.min(100, (perHour / 600) * 100);
      }

      case "applications": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) return 0;

        const perHour = numericValue / (screenTime / 3600);

        return Math.min(100, (perHour / 20) * 100);
      }

      default:
        return 0;
    }
  };

  // ========================================================
  // METRIC VALUES
  // ========================================================

  const screenProgress = getMetricProgress(
    "screen",
    latest?.screen_time
  );

  const activeProgress = getMetricProgress(
    "active",
    latest?.active_time,
    { screenTime: latest?.screen_time }
  );

  const idleProgress = getMetricProgress(
    "idle",
    latest?.idle_time,
    { screenTime: latest?.screen_time }
  );

  const keyboardProgress = getMetricProgress(
    "keyboard",
    latest?.keyboard_count,
    { screenTime: latest?.screen_time }
  );

  const mouseProgress = getMetricProgress(
    "mouse",
    latest?.mouse_clicks,
    { screenTime: latest?.screen_time }
  );

  const applicationProgress = getMetricProgress(
    "applications",
    latest?.application_switches,
    { screenTime: latest?.screen_time }
  );

  // ========================================================
  // METRIC TRENDS
  // ========================================================

  const screenTrend = calculateTrend(
    latest?.screen_time,
    previous?.screen_time,
    older?.screen_time
  );

  const activeTrend = calculateTrend(
    latest?.active_time,
    previous?.active_time,
    older?.active_time
  );

  const idleTrend = calculateTrend(
    latest?.idle_time,
    previous?.idle_time,
    older?.idle_time
  );

  const keyboardTrend = calculateTrend(
    latest?.keyboard_count,
    previous?.keyboard_count,
    older?.keyboard_count
  );

  const mouseTrend = calculateTrend(
    latest?.mouse_clicks,
    previous?.mouse_clicks,
    older?.mouse_clicks
  );

  const applicationTrend = calculateTrend(
    latest?.application_switches,
    previous?.application_switches,
    older?.application_switches
  );

  // ========================================================
  // METRIC STATUSES
  // ========================================================

  const screenStatus = getMetricStatus(
    "screen",
    latest?.screen_time
  );

  const activeStatus = getMetricStatus(
    "active",
    latest?.active_time,
    { screenTime: latest?.screen_time }
  );

  const idleStatus = getMetricStatus(
    "idle",
    latest?.idle_time,
    { screenTime: latest?.screen_time }
  );

  const keyboardStatus = getMetricStatus(
    "keyboard",
    latest?.keyboard_count,
    { screenTime: latest?.screen_time }
  );

  const mouseStatus = getMetricStatus(
    "mouse",
    latest?.mouse_clicks,
    { screenTime: latest?.screen_time }
  );

  const applicationStatus = getMetricStatus(
    "applications",
    latest?.application_switches,
    { screenTime: latest?.screen_time }
  );

  // ========================================================
  // DASHBOARD UI
  // ========================================================

  return (
    <div className="w-full max-w-[1700px] mx-auto px-6 py-4 space-y-4">
      {/* TOAST NOTIFICATION */}

      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 
    min-w-[300px] max-w-md px-4 py-3 rounded-xl shadow-lg border
    animate-in slide-in-from-right-5 duration-300
    ${toast.type === "error"
              ? "bg-white border-red-200 text-red-700"
              : "bg-white border-emerald-200 text-emerald-700"
            }`}
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0
      ${toast.type === "error"
                ? "bg-red-50"
                : "bg-emerald-50"
              }`}
          >
            {toast.type === "error" ? (
              <X size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </div>

          <p className="text-sm font-medium flex-1">
            {toast.message}
          </p>

          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>
      )}
      <OverviewBanner
        mode={mode}
        fatigueResponse={fatigueResponse}
        isRunning={isRunning}
        latest={latest}
        recordCount={recordCount}
        lastSyncAt={lastSyncAt}
        aiStatus={aiStatus}
        burnoutRisk={burnoutRisk}
        healthScore={healthScore}
        recommendations={displayRecommendations}
        user={user}
      />


      {/* TODAY'S OVERVIEW */}

      <section>

        <div className="flex items-end justify-between ms-2 mb-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Today's Overview
            </h2>

            <p className="text-md text-slate-500 mt-1">
              {isAI
                ? "AI-powered desktop and attention monitoring"
                : "Current desktop monitoring metrics"}
            </p>
          </div>

          <div className="flex items-center gap-2 mr-4">

            <span className="relative flex h-2.5 w-2.5">

              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${isRunning
                  ? "bg-emerald-400 animate-ping"
                  : "bg-slate-300"
                  }`}
              />

              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isRunning
                  ? "bg-emerald-500"
                  : "bg-slate-400"
                  }`}
              />

            </span>

            <span
              className={`text-md font-medium ${isRunning
                ? "text-emerald-600"
                : "text-slate-500"
                }`}
            >
              {isRunning ? "Live data" : "Not running"}
            </span>

          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

          <MetricCard
            title="Screen Time"
            value={latest ? secondsToHm(latest.screen_time) : "—"}
            icon={Clock3}
            color="bg-blue-600"
            progress={screenProgress}
            progressLabel="Daily usage"
            trend={screenTrend}
            status={loading && !latest ? "Loading" : screenStatus}
            updated={latest ? "Last captured" : "—"}
          />

          <MetricCard
            title="Active Time"
            value={latest ? secondsToHm(latest.active_time) : "—"}
            icon={Activity}
            color="bg-emerald-600"
            progress={activeProgress}
            progressLabel="Activity"
            trend={activeTrend}
            status={loading && !latest ? "Loading" : activeStatus}
            updated={latest ? "Last captured" : "—"}
          />

          <MetricCard
            title="Idle Time"
            value={latest ? secondsToHm(latest.idle_time) : "—"}
            icon={Coffee}
            color="bg-amber-500"
            progress={idleProgress}
            progressLabel="Idle"
            trend={idleTrend}
            status={loading && !latest ? "Loading" : idleStatus}
            updated={latest ? "Last captured" : "—"}
          />

          <MetricCard
            title="Keyboard Activity"
            value={latest ? latest.keyboard_count : "—"}
            icon={Keyboard}
            color="bg-indigo-600"
            progress={keyboardProgress}
            progressLabel="Keystrokes"
            trend={keyboardTrend}
            status={loading && !latest ? "Loading" : keyboardStatus}
            updated={latest ? "Last captured" : "—"}
          />

          <MetricCard
            title="Mouse Activity"
            value={latest ? latest.mouse_clicks : "—"}
            icon={Mouse}
            color="bg-violet-600"
            progress={mouseProgress}
            progressLabel="Clicks"
            trend={mouseTrend}
            status={loading && !latest ? "Loading" : mouseStatus}
            updated={latest ? "Last captured" : "—"}
          />

          <MetricCard
            title="Application Switches"
            value={latest ? latest.application_switches : "—"}
            icon={Repeat2}
            color="bg-cyan-600"
            progress={applicationProgress}
            progressLabel="Switches"
            trend={applicationTrend}
            status={loading && !latest ? "Loading" : applicationStatus}
            updated={latest ? "Last captured" : "—"}
          />

        </div>

      </section>

      {/* ACTIVITY CHART AND AI STATUS */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        <div className={isAI ? "xl:col-span-2" : "xl:col-span-3"}>
          <ActivityChart records={desktopActivityHistory} />
        </div>

        {isAI && (
          <div className="xl:col-span-1">

            <AIStatusCard
              aiStatus={aiStatus}
              fatigueScore={fatigueScore}
              burnoutRisk={burnoutRisk}
              burnoutScore={burnoutScore}
              healthScore={healthScore}
              healthLevel={healthLevel}
            />

          </div>
        )}

      </div>

      {/* APPLICATION AND KEYBOARD/MOUSE CHARTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <ApplicationPieChart records={activityRecords} />

        <KeyboardMouseChart records={keyboardMouseHistory} />

      </div>

      {/* CAMERA AND ENVIRONMENT */}

      <div className="grid grid-cols-2 gap-4">

        <CameraAttentionCard latest={latest} />

        <EnvironmentCard latest={latest} />

      </div>

      {/* DEVICE STATUS AND RECENT ACTIVITY */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        <DeviceStatusCard latest={latest} />

        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-800">
              Recent Activity
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Latest monitoring events
            </p>

          </div>

          <ActivityFeed activities={activityHistory} />

        </section>

      </div>

    </div>
  );
};

// ============================================================
// AI STATUS CARD
// ============================================================

const AIStatusCard = ({
  aiStatus,
  fatigueScore,
  burnoutRisk,
  burnoutScore,
  healthScore,
  healthLevel,
}) => {

  const riskStyle =
    burnoutRisk === "High"
      ? "bg-red-50 text-red-600"
      : burnoutRisk === "Medium"
        ? "bg-amber-50 text-amber-600"
        : "bg-emerald-50 text-emerald-600";

  const fatigueStyle =
    aiStatus === "High"
      ? "bg-red-50 text-red-600"
      : aiStatus === "Medium"
        ? "bg-amber-50 text-amber-600"
        : "bg-emerald-50 text-emerald-600";

  const healthStyle =
    healthLevel === "Poor"
      ? "bg-red-50 text-red-600"
      : healthLevel === "Moderate"
        ? "bg-amber-50 text-amber-600"
        : "bg-emerald-50 text-emerald-600";

  return (

    <div className="h-full bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-2">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            AI Status
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Current AI analysis
          </p>
        </div>

        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">

          <BrainCircuit
            className="text-blue-600"
            size={21}
          />

        </div>

      </div>

      {/* FATIGUE */}

      <div className="flex items-center justify-between py-2 border-b border-slate-100">

        <div>
          <span className="text-sm text-slate-500">
            Fatigue
          </span>

          <p className="text-xs text-slate-400 mt-1">
            Score: {fatigueScore ?? "—"}/100
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${fatigueStyle}`}>
          {aiStatus || "No prediction"}
        </span>

      </div>

      {/* BURNOUT */}

      <div className="flex items-center justify-between py-2 border-b border-slate-100">

        <div>
          <span className="text-sm text-slate-500">
            Burnout Risk
          </span>

          <p className="text-xs text-slate-400 mt-1">
            Score: {burnoutScore ?? "—"}/100
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${riskStyle}`}>
          {burnoutRisk || "No prediction"}
        </span>

      </div>

      {/* HEALTH */}

      <div className="flex items-center justify-between py-2">

        <div>
          <span className="text-sm text-slate-500">
            Health
          </span>

          <p className="text-xs text-slate-400 mt-1">
            Score: {healthScore ?? "—"}/100
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${healthStyle}`}>
          {healthLevel || "No prediction"}
        </span>

      </div>

    </div>
  );
};

export default Dashboard;

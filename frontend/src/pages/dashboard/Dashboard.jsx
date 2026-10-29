import React, { useEffect, useState, useCallback } from "react";

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
  getMonitoringStatus,
  getCurrentMonitoring,
  getMonitoringData,
  getDataCollectionProgress,
  startMonitoring,
  stopMonitoring,
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
} from "lucide-react";

const POLL_MS = 8000;

const Dashboard = () => {
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        return JSON.parse(storedUser);
      }

      return {
        id: localStorage.getItem("user_id"),
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
      };
    } catch (error) {
      console.error("Failed to read stored user:", error);

      return {
        id: localStorage.getItem("user_id"),
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
      };
    }
  };

  const user = getStoredUser();

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId =
    storedUser?.id ??
    localStorage.getItem("user_id") ??
    null;

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("selectedMode") || null;
  });
  const isDataCollection =
    mode === "data_collection";
  const isAI = mode === "ai_monitoring";

  const [fatigueResponse, setFatigueResponse] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // ----------------------------------------------------------
  // LAST COMPLETED AI RESULT
  // Keeps the final AI result visible after monitoring stops.
  // ----------------------------------------------------------
  const [lastAIPrediction, setLastAIPrediction] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("lastAIPrediction") || "null"
      );
    } catch {
      return null;
    }
  });

  const [lastAIRecommendations, setLastAIRecommendations] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("lastAIRecommendations") || "[]"
      );
    } catch {
      return [];
    }
  });
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lastSessionId, setLastSessionId] = useState(() => {
    return localStorage.getItem("lastSessionId") || null;
  });
  const [latest, setLatest] = useState(null);
  const [keyboardMouseHistory, setKeyboardMouseHistory] = useState([]);
  const [desktopActivityHistory, setDesktopActivityHistory] = useState([]);
  const [activityRecords, setActivityRecords] = useState([]);
  const [previous, setPrevious] = useState(null);
  const [older, setOlder] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displaySessionId = sessionId ?? lastSessionId;

  // ==========================================================
  // FETCH CURRENT STATE
  // ==========================================================
  const refresh = useCallback(async () => {
    if (!userId) {
      setError("No user_id found — please log in.");
      setLoading(false);
      return;
    }

    try {
      // ==========================================================
      // 1. MONITORING STATUS
      // ==========================================================

      const { data: status } = await getMonitoringStatus();

      setIsRunning(status.running);
      setSessionId(status.session_id ?? null);
      if (status.session_id) {
        setLastSessionId(status.session_id);
        localStorage.setItem("lastSessionId", status.session_id);
      }

      // ==========================================================
      // 2. CURRENT MONITORING SESSION
      //    Gets mode + last_sync_at
      // ==========================================================

      const { data: current } =
        await getCurrentMonitoring(userId);

      const mapBackendModeToFrontend = (backendMode) => {
        switch (backendMode) {
          case "DATA_COLLECTION":
            return "data_collection";

          case "AI_MONITORING":
            return "ai_monitoring";

          default:
            return null;
        }
      };

      if (
        current.success &&
        current.has_active_session &&
        current.session
      ) {
        // ------------------------------------------
        // MODE
        // ------------------------------------------

        setMode(
          mapBackendModeToFrontend(
            current.session.mode
          )
        );

        // ------------------------------------------
        // LAST SYNC
        // ------------------------------------------

        setLastSyncAt(
          current.session.last_sync_at || null
        );
      }

      // ==========================================================
      // 3. LATEST FATIGUE SELF-REPORT
      // ==========================================================

      const { data: fatigue } =
        await getLatestFatigue(userId);

      if (fatigue.success) {
        setFatigueResponse(fatigue.level);
      }

      // ==========================================================
      // 4. CURRENT SESSION ACTIVITY DATA
      // ==========================================================

      if (status.session_id) {
        const { data: history } =
          await getMonitoringData(
            userId,
            status.session_id
          );

        if (history.success) {

          const records = history.data || [];

          setActivityHistory(records);
          setActivityRecords(records);

          setLatest(records.length > 0 ? records[0] : null);
          setPrevious(records.length > 1 ? records[1] : null);
          setOlder(records.length > 2 ? records[2] : null);
        }
      } else {
        // No active session
      }

      // ==========================================================
      // 4B. HISTORICAL KEYBOARD / MOUSE DATA
      // Used for the 7-day chart
      // ==========================================================

      const { data: historyResponse } =
        await getMonitoringData(userId);

      if (historyResponse.success) {
        const historicalRecords =
          historyResponse.data || [];

        setKeyboardMouseHistory(historicalRecords);

        setDesktopActivityHistory(historicalRecords);
      }
      // ==========================================================
      // 5. BACKEND AI PREDICTION
      // ==========================================================

      const backendMode =
        current?.session?.mode || null;

      const backendIsAI =
        backendMode === "AI_MONITORING";

      if (backendIsAI) {
        const { data: predictionData } =
          await getCurrentPrediction(userId);

        if (
          predictionData.success &&
          predictionData.has_prediction &&
          predictionData.prediction
        ) {
          // Current live prediction
          setPrediction(predictionData.prediction);

          // Save as the latest AI result
          setLastAIPrediction(predictionData.prediction);

          localStorage.setItem(
            "lastAIPrediction",
            JSON.stringify(predictionData.prediction)
          );
        }
      }

      // ==========================================================
      // 6. BACKEND RECOMMENDATIONS
      // ==========================================================

      if (backendIsAI) {
        const { data: recommendationData } =
          await getCurrentRecommendations(userId);

        if (recommendationData.success) {
          setRecommendations(
            recommendationData.has_recommendations
              ? recommendationData.recommendations
              : []
          );
        } else {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }

      // ==========================================================
      // 5. CUMULATIVE DATA COLLECTION PROGRESS
      // ==========================================================

      const { data: progress } =
        await getDataCollectionProgress(userId);

      if (progress.success) {
        setRecordCount(progress.record_count);
      }

      // ==========================================================
      // SUCCESS
      // ==========================================================

      setError(null);

    } catch (err) {
      console.error(
        "Dashboard refresh error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
        "Failed to load monitoring data"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // ==========================================================
  // START / STOP
  // ==========================================================

  const handleStart = async () => {
    try {

      const selectedMode = isAI
        ? "AI_MONITORING"
        : "DATA_COLLECTION";

      // ------------------------------------------------------
      // DATA COLLECTION
      // Clear previous AI results because this is a
      // completely different monitoring mode.
      // ------------------------------------------------------
      if (selectedMode === "DATA_COLLECTION") {

        setPrediction(null);
        setRecommendations([]);

        setLastAIPrediction(null);
        setLastAIRecommendations([]);

        localStorage.removeItem(
          "lastAIPrediction"
        );

        localStorage.removeItem(
          "lastAIRecommendations"
        );
      }

      // ------------------------------------------------------
      // NEW AI SESSION
      // Clear previous session's AI result.
      // ------------------------------------------------------
      if (selectedMode === "AI_MONITORING") {

        setPrediction(null);
        setRecommendations([]);

        setLastAIPrediction(null);
        setLastAIRecommendations([]);

        localStorage.removeItem(
          "lastAIPrediction"
        );

        localStorage.removeItem(
          "lastAIRecommendations"
        );
      }

      await startMonitoring(
        userId,
        selectedMode
      );

      await refresh();

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Failed to start monitoring"
      );
    }
  };
  const handleStop = async () => {
    try {

      // ------------------------------------------------------
      // If this is AI monitoring, capture the final result
      // BEFORE stopping the backend session.
      // ------------------------------------------------------
      if (isAI) {

        try {
          const { data: predictionData } =
            await getCurrentPrediction(userId);

          if (
            predictionData.success &&
            predictionData.has_prediction &&
            predictionData.prediction
          ) {
            setPrediction(predictionData.prediction);
            setLastAIPrediction(
              predictionData.prediction
            );

            localStorage.setItem(
              "lastAIPrediction",
              JSON.stringify(
                predictionData.prediction
              )
            );
          }
        } catch (predictionError) {
          console.warn(
            "Could not capture final AI prediction:",
            predictionError
          );
        }

        try {
          const { data: recommendationData } =
            await getCurrentRecommendations(userId);

          if (
            recommendationData.success &&
            recommendationData.has_recommendations
          ) {
            const finalRecommendations =
              recommendationData.recommendations || [];

            setRecommendations(finalRecommendations);
            setLastAIRecommendations(
              finalRecommendations
            );

            localStorage.setItem(
              "lastAIRecommendations",
              JSON.stringify(
                finalRecommendations
              )
            );
          }
        } catch (recommendationError) {
          console.warn(
            "Could not capture final recommendations:",
            recommendationError
          );
        }
      }

      // ------------------------------------------------------
      // NOW stop monitoring
      // ------------------------------------------------------
      await stopMonitoring();

      setIsRunning(false);
      setSessionId(null);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Failed to stop monitoring"
      );
    }
  };

  const handleFatigueSubmit = async (level) => {
    try {
      await saveFatigueReport(userId, level);
      setFatigueResponse(level);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save fatigue report");
    }
  };

  // ==========================================================
  // AI DISPLAY RESULT
  //
  // While running:
  //     use current prediction
  //
  // After stopping:
  //     use last saved AI prediction
  // ==========================================================

  const displayPrediction =
    prediction || lastAIPrediction;

  const displayRecommendations =
    recommendations.length > 0
      ? recommendations
      : lastAIRecommendations;

  const aiStatus =
    isAI
      ? displayPrediction?.fatigue?.level || "No prediction"
      : null;

  const burnoutRisk =
    isAI
      ? displayPrediction?.burnout?.level || "No prediction"
      : null;

  const healthScore =
    isAI
      ? displayPrediction?.health?.score ?? null
      : null;

  const healthLevel =
    isAI
      ? displayPrediction?.health?.level || "No prediction"
      : null;

  const fatigueScore =
    isAI
      ? displayPrediction?.fatigue?.score ?? null
      : null;

  const burnoutScore =
    isAI
      ? displayPrediction?.burnout?.score ?? null
      : null;


  // ==========================================================
  // METRIC HELPERS
  // ==========================================================

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

    const latest = Number(latestValue);
    const previous = Number(previousValue);
    const older = Number(olderValue);

    if (
      !Number.isFinite(latest) ||
      !Number.isFinite(previous) ||
      !Number.isFinite(older)
    ) {
      return "0%";
    }

    // Current interval
    const currentInterval = latest - previous;

    // Previous interval
    const previousInterval = previous - older;

    // No meaningful previous activity
    if (previousInterval === 0) {
      if (currentInterval === 0) {
        return "0%";
      }

      return currentInterval > 0 ? "+100%" : "-100%";
    }

    const change =
      ((currentInterval - previousInterval) /
        Math.abs(previousInterval)) *
      100;

    if (Math.abs(change) < 0.1) {
      return "0%";
    }

    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };
  // ==========================================================
  // METRIC STATUS
  // ==========================================================

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

      // ------------------------------------------------------
      // SCREEN TIME
      // ------------------------------------------------------
      case "screen": {
        const hours = numericValue / 3600;

        if (hours <= 4) return "Healthy";
        if (hours <= 6) return "Warning";

        return "Critical";
      }

      // ------------------------------------------------------
      // ACTIVE TIME
      // Based on percentage of screen time
      // ------------------------------------------------------
      case "active": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return "Normal";
        }

        const activePercentage =
          (numericValue / screenTime) * 100;

        if (activePercentage >= 60) return "Healthy";
        if (activePercentage >= 40) return "Warning";

        return "Critical";
      }

      // ------------------------------------------------------
      // IDLE TIME
      // Based on percentage of screen time
      // ------------------------------------------------------
      case "idle": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return "Normal";
        }

        const idlePercentage =
          (numericValue / screenTime) * 100;

        if (idlePercentage <= 30) return "Healthy";
        if (idlePercentage <= 50) return "Warning";

        return "Critical";
      }

      // ------------------------------------------------------
      // KEYBOARD
      // Based on keystrokes per hour
      // ------------------------------------------------------
      case "keyboard": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return "Normal";
        }

        const hours = screenTime / 3600;
        const keystrokesPerHour =
          numericValue / hours;

        if (keystrokesPerHour <= 3000) {
          return "Healthy";
        }

        if (keystrokesPerHour <= 5000) {
          return "Warning";
        }

        return "Critical";
      }

      // ------------------------------------------------------
      // MOUSE
      // Based on clicks per hour
      // ------------------------------------------------------
      case "mouse": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return "Normal";
        }

        const hours = screenTime / 3600;
        const clicksPerHour =
          numericValue / hours;

        if (clicksPerHour <= 600) {
          return "Healthy";
        }

        if (clicksPerHour <= 1000) {
          return "Warning";
        }

        return "Critical";
      }

      // ------------------------------------------------------
      // APPLICATION SWITCHES
      // Based on switches per hour
      // ------------------------------------------------------
      case "applications": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return "Normal";
        }

        const hours = screenTime / 3600;
        const switchesPerHour =
          numericValue / hours;

        if (switchesPerHour <= 20) {
          return "Healthy";
        }

        if (switchesPerHour <= 40) {
          return "Warning";
        }

        return "Critical";
      }

      default:
        return "Normal";
    }
  };
  // ==========================================================
  // METRIC PROGRESS
  // ==========================================================

  const getMetricProgress = (
    metric,
    value,
    context = {}
  ) => {
    if (value === null || value === undefined) {
      return 0;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    switch (metric) {

      // 8 hour working-day reference
      case "screen":
        return Math.min(
          100,
          (numericValue / 28800) * 100
        );

      // Active percentage
      case "active": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return 0;
        }

        return Math.min(
          100,
          (numericValue / screenTime) * 100
        );
      }

      // Idle percentage
      case "idle": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return 0;
        }

        return Math.min(
          100,
          (numericValue / screenTime) * 100
        );
      }

      // Keyboard: reference = 3000 keystrokes/hour
      case "keyboard": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return 0;
        }

        const hours = screenTime / 3600;
        const perHour = numericValue / hours;

        return Math.min(
          100,
          (perHour / 3000) * 100
        );
      }

      // Mouse: reference = 600 clicks/hour
      case "mouse": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return 0;
        }

        const hours = screenTime / 3600;
        const perHour = numericValue / hours;

        return Math.min(
          100,
          (perHour / 600) * 100
        );
      }

      // Applications: reference = 20 switches/hour
      case "applications": {
        const screenTime = Number(context.screenTime);

        if (!screenTime || screenTime <= 0) {
          return 0;
        }

        const hours = screenTime / 3600;
        const perHour = numericValue / hours;

        return Math.min(
          100,
          (perHour / 20) * 100
        );
      }

      default:
        return 0;
    }
  };
  const screenProgress = getMetricProgress(
    "screen",
    latest?.screen_time
  );

  const activeProgress = getMetricProgress(
    "active",
    latest?.active_time,
    {
      screenTime: latest?.screen_time,
    }
  );

  const idleProgress = getMetricProgress(
    "idle",
    latest?.idle_time,
    {
      screenTime: latest?.screen_time,
    }
  );

  const keyboardProgress = getMetricProgress(
    "keyboard",
    latest?.keyboard_count,
    {
      screenTime: latest?.screen_time,
    }
  );

  const mouseProgress = getMetricProgress(
    "mouse",
    latest?.mouse_clicks,
    {
      screenTime: latest?.screen_time,
    }
  );

  const applicationProgress = getMetricProgress(
    "applications",
    latest?.application_switches,
    {
      screenTime: latest?.screen_time,
    }
  );
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
  const screenStatus = getMetricStatus(
    "screen",
    latest?.screen_time
  );

  const activeStatus = getMetricStatus(
    "active",
    latest?.active_time,
    {
      screenTime: latest?.screen_time,
    }
  );

  const idleStatus = getMetricStatus(
    "idle",
    latest?.idle_time,
    {
      screenTime: latest?.screen_time,
    }
  );

  const keyboardStatus = getMetricStatus(
    "keyboard",
    latest?.keyboard_count,
    {
      screenTime: latest?.screen_time,
    }
  );

  const mouseStatus = getMetricStatus(
    "mouse",
    latest?.mouse_clicks,
    {
      screenTime: latest?.screen_time,
    }
  );

  const applicationStatus = getMetricStatus(
    "applications",
    latest?.application_switches,
    {
      screenTime: latest?.screen_time,
    }
  );
  return (
    <div className="w-full max-w-[1700px] mx-auto px-6 py-4 space-y-4">

      {/* START / STOP CONTROL */}
      <div className="flex items-center ms-2 gap-3">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-md font-semibold hover:bg-red-700"
          >
            Stop Monitoring
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-md font-semibold hover:bg-blue-700"
          >
            Start Monitoring
          </button>
        )}
      </div>
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <section>
        <div className="flex items-end justify-between ms-2 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Today's Overview</h2>
            <p className="text-md text-slate-500 mt-1">
              {isAI
                ? "AI-powered desktop and attention monitoring"
                : "Current desktop monitoring metrics"}
            </p>
          </div>

          <div className="flex items-center gap-2 mr-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${isRunning ? "bg-emerald-400 animate-ping" : "bg-slate-300"}`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isRunning ? "bg-emerald-500" : "bg-slate-400"}`} />
            </span>
            <span className={`text-md font-medium ${isRunning ? "text-emerald-600" : "text-slate-500"}`}>
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
            status={loading ? "Loading" : screenStatus}
            updated={latest ? "Just now" : "—"}
          />

          <MetricCard
            title="Active Time"
            value={latest ? secondsToHm(latest.active_time) : "—"}
            icon={Activity}
            color="bg-emerald-600"
            progress={activeProgress}
            progressLabel="Activity"
            trend={activeTrend}
            status={loading ? "Loading" : activeStatus}
            updated={latest ? "Just now" : "—"}
          />

          <MetricCard
            title="Idle Time"
            value={latest ? secondsToHm(latest.idle_time) : "—"}
            icon={Coffee}
            color="bg-amber-500"
            progress={idleProgress}
            progressLabel="Idle"
            trend={idleTrend}
            status={loading ? "Loading" : idleStatus}
            updated={latest ? "Just now" : "—"}
          />

          <MetricCard
            title="Keyboard Activity"
            value={latest ? latest.keyboard_count : "—"}
            icon={Keyboard}
            color="bg-indigo-600"
            progress={keyboardProgress}
            progressLabel="Keystrokes"
            trend={keyboardTrend}
            status={loading ? "Loading" : keyboardStatus}
            updated={latest ? "Just now" : "—"}
          />

          <MetricCard
            title="Mouse Activity"
            value={latest ? latest.mouse_clicks : "—"}
            icon={Mouse}
            color="bg-violet-600"
            progress={mouseProgress}
            progressLabel="Clicks"
            trend={mouseTrend}
            status={loading ? "Loading" : mouseStatus}
            updated={latest ? "Just now" : "—"}
          />

          <MetricCard
            title="Application Switches"
            value={latest ? latest.application_switches : "—"}
            icon={Repeat2}
            color="bg-cyan-600"
            progress={applicationProgress}
            progressLabel="Switches"
            trend={applicationTrend}
            status={loading ? "Loading" : applicationStatus}
            updated={latest ? "Just now" : "—"}
          />

        </div>
      </section>

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ApplicationPieChart records={activityRecords} />
        <KeyboardMouseChart records={keyboardMouseHistory} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CameraAttentionCard latest={latest} />
        <EnvironmentCard latest={latest} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DeviceStatusCard latest={latest} />

        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
            <p className="text-sm text-slate-500 mt-1">Latest monitoring events</p>
          </div>
          <ActivityFeed activities={activityHistory} />
        </section>
      </div>
    </div>
  );
};
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

      {/* Header */}
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

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${fatigueStyle}`}
        >
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

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${riskStyle}`}
        >
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

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${healthStyle}`}
        >
          {healthLevel || "No prediction"}
        </span>
      </div>

    </div>
  );
};
export default Dashboard;
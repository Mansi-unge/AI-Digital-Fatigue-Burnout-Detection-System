import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
  Activity,
} from "lucide-react";

import ActivityMetrics from "./ActivityMetrics";
import ActivityChart from "./ActivityChart";
import ActivityFeed from "./ActivityFeed";
import ActivitySummary from "./ActivitySummary";

import {
  getMonitoringStatus,
  getMonitoringData,
} from "../../api/monitoringApi";

const REFRESH_INTERVAL = 10000;

const ActivityLogic = () => {
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [monitoringActive, setMonitoringActive] =
    useState(false);

  const [activityLive, setActivityLive] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [error, setError] = useState("");

  /* =====================================================
     USER ID
  ===================================================== */

  const getUserId = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      return (
        user?.id ||
        user?.user_id ||
        null
      );
    } catch (err) {
      console.error(
        "Unable to read user:",
        err
      );

      return null;
    }
  };

  /* =====================================================
     TIMESTAMP
  ===================================================== */

  const getRecordTimestamp = useCallback(
    (record) => {
      if (!record) {
        return 0;
      }

      const raw =
        record.created_at ||
        record.timestamp ||
        record.recorded_at ||
        record.updated_at;

      if (!raw) {
        return 0;
      }

      try {
        let normalized = String(raw);

        if (
          normalized.includes("T") &&
          !normalized.endsWith("Z") &&
          !/[+-]\d{2}:\d{2}$/.test(
            normalized
          )
        ) {
          normalized += "Z";
        }

        const timestamp =
          new Date(normalized).getTime();

        return Number.isNaN(timestamp)
          ? 0
          : timestamp;
      } catch {
        return 0;
      }
    },
    []
  );

  /* =====================================================
     MONITORING STATUS
  ===================================================== */

  const fetchMonitoringStatus =
    useCallback(async () => {
      try {
        const response =
          await getMonitoringStatus();

        const data = response?.data;

        return Boolean(
          data?.active ??
          data?.running ??
          data?.monitoring_active ??
          data?.is_running ??
          false
        );
      } catch (err) {
        console.warn(
          "Monitoring status unavailable:",
          err
        );

        return false;
      }
    }, []);

  /* =====================================================
     FETCH ACTIVITY DATA
  ===================================================== */

  const fetchActivityData =
    useCallback(
      async (manualRefresh = false) => {
        const userId = getUserId();

        if (!userId) {
          setError(
            "User session not found."
          );

          setLoading(false);

          return;
        }

        if (manualRefresh) {
          setRefreshing(true);
        }

        try {
          setError("");

          /* -------------------------------
             MONITORING STATUS
          -------------------------------- */

          const currentMonitoringStatus =
            await fetchMonitoringStatus();

          setMonitoringActive(
            currentMonitoringStatus
          );

          /* -------------------------------
             ACTIVITY DATA
          -------------------------------- */

          const response =
            await getMonitoringData(userId);

          const responseData =
            response?.data;

          /* -------------------------------
             EXTRACT RECORDS
          -------------------------------- */

          let activityRecords = [];

          if (
            Array.isArray(
              responseData?.data
            )
          ) {
            activityRecords =
              responseData.data;
          } else if (
            Array.isArray(responseData)
          ) {
            activityRecords =
              responseData;
          }

          /* -------------------------------
             NEWEST FIRST
          -------------------------------- */

          activityRecords.sort(
            (a, b) =>
              getRecordTimestamp(b) -
              getRecordTimestamp(a)
          );

          setRecords(activityRecords);

          /* -------------------------------
             LIVE STATE
          -------------------------------- */

          const live =
            typeof responseData?.activity_live ===
              "boolean"
              ? responseData.activity_live
              : currentMonitoringStatus;

          setActivityLive(
            Boolean(live)
          );

          setLastUpdated(
            new Date()
          );
        } catch (err) {
          console.error(
            "Activity data error:",
            err
          );

          /*
           * Do not expose raw Axios/backend
           * errors to the frontend.
           */

          setError(
            "Unable to load activity data. Please check that monitoring is running."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        fetchMonitoringStatus,
        getRecordTimestamp,
      ]
    );

  /* =====================================================
     INITIAL LOAD + AUTO REFRESH
  ===================================================== */

  useEffect(() => {
    fetchActivityData(false);

    const interval = setInterval(() => {
      fetchActivityData(false);
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [fetchActivityData]);

  /* =====================================================
     LATEST RECORD
  ===================================================== */

  const latest = useMemo(() => {
    return records.length > 0
      ? records[0]
      : null;
  }, [records]);

  /* =====================================================
     LATEST METRICS
     IMPORTANT:
     ONLY latest record.
  ===================================================== */

  const metrics = useMemo(() => {
    return {
      screenTimeSeconds:
        Number(
          latest?.screen_time
        ) || 0,

      activeTimeSeconds:
        Number(
          latest?.active_time
        ) || 0,

      idleTimeSeconds:
        Number(
          latest?.idle_time
        ) || 0,

      keyboardCount:
        Number(
          latest?.keyboard_count
        ) || 0,

      mouseClicks:
        Number(
          latest?.mouse_clicks
        ) || 0,

      scrollCount:
        Number(
          latest?.scroll_count
        ) || 0,
    };
  }, [latest]);

  /* =====================================================
     CURRENT APPLICATION
  ===================================================== */

  const currentApplication =
    useMemo(() => {
      const raw =
        latest?.active_application ||
        latest?.application_name ||
        latest?.current_application ||
        latest?.app_name ||
        "No active application";

      const value =
        String(raw).trim();

      if (!value) {
        return "No active application";
      }

      const lower =
        value.toLowerCase();

      if (
        lower.includes("chrome")
      ) {
        return "Google Chrome";
      }

      if (
        lower.includes("edge")
      ) {
        return "Microsoft Edge";
      }

      if (
        lower.includes("firefox")
      ) {
        return "Mozilla Firefox";
      }

      if (
        lower.includes("code") ||
        lower.includes("visual studio")
      ) {
        return "VS Code";
      }

      if (
        lower.includes("spotify")
      ) {
        return "Spotify";
      }

      if (
        lower.includes("explorer")
      ) {
        return "File Explorer";
      }

      return value;
    }, [latest]);

  /* =====================================================
     LATEST RECORD TIME
  ===================================================== */

  const latestRecordTime =
    useMemo(() => {
      if (!latest) {
        return null;
      }

      const timestamp =
        getRecordTimestamp(
          latest
        );

      if (!timestamp) {
        return null;
      }

      return new Date(timestamp);
    }, [
      latest,
      getRecordTimestamp,
    ]);

  /* =====================================================
     LAST UPDATED LABEL
  ===================================================== */

  const updatedLabel =
    useMemo(() => {
      if (!lastUpdated) {
        return "Waiting for data";
      }

      return lastUpdated.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );
    }, [lastUpdated]);

  /* =====================================================
     MANUAL REFRESH
  ===================================================== */

  const handleRetry = () => {
    fetchActivityData(true);
  };

  /* =====================================================
     LOADING UI
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-full bg-[#f5f7fb] p-6 lg:p-8">
        <div className="min-h-[650px] flex items-center justify-center">
          <div className="text-center">

            {/* Loading Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
            </div>

            {/* Title */}
            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading Activity Workspace
            </h2>

            {/* Description */}
            <p className="mt-1 text-sm text-slate-500">
              Loading your latest desktop activity data...
            </p>

          </div>
        </div>
      </div>
    );
  }
  /* =====================================================
     MAIN LAYOUT
  ===================================================== */

  return (
    <div className="min-h-full bg-[#f5f7fb] px-4 py-5 text-slate-800 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* ===============================================
            HEADER
        =============================================== */}
        {/* =====================================================
    HEADER
===================================================== */}

        <header className="relative">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* =================================================
        LEFT SIDE
    ================================================= */}

            <div className="flex items-start gap-5">

              {/* Activity Icon */}

              <div className="relative shrink-0">

                <div
                  className="
            flex
            h-[70px]
            w-[70px]
            items-center
            justify-center
            rounded-[22px]
            bg-gradient-to-br
            from-blue-600
            to-indigo-600
            text-white
            shadow-lg
            shadow-blue-200
          "
                >
                  <Activity
                    size={34}
                    strokeWidth={2}
                  />
                </div>

                {/* Live indicator */}

                <span
                  className={`
            absolute
            -bottom-1
            -right-1
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            border-[3px]
            border-[#f5f7fb]
            ${activityLive
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                    }
          `}
                >
                  {activityLive && (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  )}
                </span>

              </div>

              {/* =================================================
          TITLE + STATUS
      ================================================= */}

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-3">

                  <h1
                    className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
              sm:text-[36px]
            "
                  >
                    Activity Monitoring
                  </h1>

                  {/* Status Pill */}

                  <span
                    className={`
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              px-4
              py-2
              text-sm
              font-semibold
              ${activityLive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500"
                      }
            `}
                  >

                    <span
                      className={`
                h-2
                w-2
                rounded-full
                ${activityLive
                          ? "animate-pulse bg-emerald-500"
                          : "bg-slate-400"
                        }
              `}
                    />

                    {activityLive
                      ? "Activity Active"
                      : "Activity Inactive"}

                  </span>

                </div>

                <p className="mt-1 text-base text-slate-500">
                  Real-time keyboard, mouse, screen and desktop activity monitoring.
                </p>

              </div>

            </div>

            {/* =================================================
        RIGHT SIDE
    ================================================= */}

            <div className="flex items-center gap-3">

              {/* Auto Refresh */}

              <div
                className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-4
          py-3
          shadow-sm
        "
              >

                <span
                  className={`
            h-3
            w-3
            rounded-full
            ${activityLive
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                    }
          `}
                />

                <span className="text-sm font-medium text-slate-500">
                  Auto refresh
                </span>

                <span className="text-sm font-bold text-slate-700">
                  10s
                </span>

              </div>

              {/* Refresh Button */}

              <button
                type="button"
                onClick={handleRetry}
                disabled={refreshing}
                className="
          inline-flex
          items-center
          gap-2
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-4
          py-3
          text-sm
          font-semibold
          text-slate-500
          shadow-sm
          transition
          hover:bg-slate-50
          hover:text-slate-700
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
              >

                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />

                <span>
                  {refreshing ? "Refreshing" : "Refresh"}
                </span>

              </button>

            </div>

          </div>

        </header>

        {/* ===============================================
            ERROR
        =============================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600">
                !
              </div>

              <div className="flex-1">

                <p className="text-sm font-semibold text-red-800">
                  Activity data unavailable
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

              </div>

              <button
                onClick={handleRetry}
                className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
              >
                Retry
              </button>

            </div>

          </div>
        )}

        {/* ===============================================
            METRICS
        =============================================== */}

        <ActivityMetrics
          metrics={metrics}
          latest={latest}
          activityLive={activityLive}
        />

        {/* ===============================================
            CHART + FEED
        =============================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">

          <ActivityChart
            records={records}
          />

          <ActivityFeed
            activities={records}
          />

        </div>

        <ActivitySummary
          metrics={metrics}
          currentApplication={currentApplication}
          monitoringActive={monitoringActive}
          activityLive={activityLive}
          latest={latest}
          lastUpdated={lastUpdated}
          latestRecordTime={latestRecordTime}
        />

      </div>

    </div>
  );
};

export default ActivityLogic;
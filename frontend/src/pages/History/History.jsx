import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Clock3,
  Database,
  Download,
  Eye,
  Filter,
  History as HistoryIcon,
  Monitor,
  RefreshCw,
  Search,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

import { getMonitoringHistory } from "../../api/monitoringApi";
import SessionDetails from "./SessionDetails";


// ============================================================
// HELPERS
// ============================================================

const getUserId = () => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      if (
        user?.id !== undefined &&
        user?.id !== null
      ) {
        return user.id;
      }

      if (
        user?.user_id !== undefined &&
        user?.user_id !== null
      ) {
        return user.user_id;
      }
    } catch (error) {
      console.warn("Invalid user data in localStorage.");
    }
  }

  return localStorage.getItem("user_id") || null;
};


// ------------------------------------------------------------
// DATE PARSING
// ------------------------------------------------------------

const parseBackendDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const raw = String(value).trim();

  if (!raw) return null;

  const hasTimezone =
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);

  const normalized = hasTimezone
    ? raw
    : `${raw}Z`;

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};


// ------------------------------------------------------------
// FORMATTERS
// ------------------------------------------------------------

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(
    Number(value) || 0
  );
};


const formatDuration = (minutes = 0) => {
  const totalMinutes = Math.max(
    0,
    Math.round(Number(minutes) || 0)
  );

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
};


const formatDate = (value) => {
  if (!value) return "--";

  const date = parseBackendDate(value);

  if (!date) return String(value);

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatTime = (value) => {
  if (!value) return "--";

  const date = parseBackendDate(value);

  if (!date) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};


const formatDateTime = (value) => {
  if (!value) return "--";

  const date = parseBackendDate(value);

  if (!date) return "--";

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const formatMonth = (value) => {
  if (!value) return "--";

  const [year, month] = String(value).split("-");

  if (!year || !month) return value;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
};


// ------------------------------------------------------------
// MODE
// ------------------------------------------------------------

const getModeLabel = (mode) => {
  if (mode === "AI_MONITORING") {
    return "AI Monitoring";
  }

  if (mode === "DATA_COLLECTION") {
    return "Data Collection";
  }

  return "Unknown";
};


// ------------------------------------------------------------
// DATE RANGE
// ------------------------------------------------------------

const getDateRange = (range) => {
  const today = new Date();

  const localDate = (date) => {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  if (range === "today") {
    const value = localDate(today);

    return {
      startDate: value,
      endDate: value,
    };
  }


  if (range === "yesterday") {
    const date = new Date(today);

    date.setDate(
      date.getDate() - 1
    );

    const value = localDate(date);

    return {
      startDate: value,
      endDate: value,
    };
  }


  if (range === "7days") {
    const start = new Date(today);

    start.setDate(
      start.getDate() - 6
    );

    return {
      startDate: localDate(start),
      endDate: localDate(today),
    };
  }


  if (range === "30days") {
    const start = new Date(today);

    start.setDate(
      start.getDate() - 29
    );

    return {
      startDate: localDate(start),
      endDate: localDate(today),
    };
  }


  if (range === "thisMonth") {
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    return {
      startDate: localDate(start),
      endDate: localDate(today),
    };
  }


  if (range === "lastMonth") {
    const start = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    return {
      startDate: localDate(start),
      endDate: localDate(end),
    };
  }


  return {
    startDate: "",
    endDate: "",
  };
};


// ============================================================
// MODE BADGE
// ============================================================

const ModeBadge = ({ mode }) => {
  const isAI = mode === "AI_MONITORING";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        border
        px-2.5 py-1
        text-[11px]
        font-bold
        ${isAI
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : "border-blue-200 bg-blue-50 text-blue-700"
        }
      `}
    >
      {isAI ? (
        <Sparkles
          size={12}
          strokeWidth={2.2}
        />
      ) : (
        <Database
          size={12}
          strokeWidth={2.2}
        />
      )}

      {getModeLabel(mode)}
    </span>
  );
};


// ============================================================
// SUMMARY ITEM
// ============================================================

const SummaryItem = ({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon
          size={20}
          strokeWidth={2.1}
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-800">
          {value}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};


// ============================================================
// SESSION CARD
// ============================================================

const SessionCard = ({
  session,
  onViewDetails,
}) => {
  const summary =
    session?.activity_summary || {};

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        transition
        hover:border-blue-200
        hover:shadow-md
      "
    >

      {/* -------------------------------------------------- */}
      {/* SESSION HEADER */}
      {/* -------------------------------------------------- */}

      <div className="px-5 py-4">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Monitor
                    size={15}
                    className="text-slate-600"
                  />
                </div>

                <span className="text-sm font-bold text-slate-900">
                  Session #{session.session_id}
                </span>

              </div>

              <ModeBadge
                mode={session.mode}
              />

              {session.is_active && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border border-emerald-200
                    bg-emerald-50
                    px-2.5 py-1
                    text-[11px]
                    font-bold
                    text-emerald-700
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              )}

            </div>


            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {formatDate(session.started_at)}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} />
                {formatTime(session.started_at)}
                {" – "}
                {session.ended_at
                  ? formatTime(session.ended_at)
                  : "Active"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Timer size={13} />
                {session.duration_formatted || "--"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Activity size={13} />
                {formatNumber(summary.record_count)} records
              </span>

            </div>

          </div>


          {/* VIEW DETAILS */}

          <button
            type="button"
            onClick={() =>
              onViewDetails(session)
            }
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-xs
              font-bold
              text-slate-700
              transition
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            <Eye size={15} />
            View Details
          </button>

        </div>

      </div>


      {/* -------------------------------------------------- */}
      {/* ACTIVITY SUMMARY */}
      {/* -------------------------------------------------- */}

      <div className="border-t border-slate-100 bg-slate-50/60">

        <div className="grid grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">

          <div className="px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Screen Time
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {formatDuration(
                Number(summary.screen_time || 0) / 60
              )}
            </p>
          </div>


          <div className="px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Time
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {formatDuration(
                Number(summary.active_time || 0) / 60
              )}
            </p>
          </div>


          <div className="px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Keyboard
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {formatNumber(
                summary.keyboard_count
              )}
            </p>
          </div>


          <div className="px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mouse Clicks
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {formatNumber(
                summary.mouse_clicks
              )}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};


// ============================================================
// DAY GROUP
// ============================================================

const DayGroup = ({
  group,
  onViewDetails,
}) => {
  return (
    <div className="space-y-3">

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <CalendarDays
              size={18}
              className="text-blue-600"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {formatDate(group.date)}
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              {group.session_count}{" "}
              {group.session_count === 1
                ? "session"
                : "sessions"}
              {" • "}
              {formatDuration(
                group.total_duration_minutes
              )}
            </p>
          </div>

        </div>

        <span
          className="
            inline-flex
            w-fit
            items-center
            rounded-full
            border border-slate-200
            bg-slate-50
            px-3 py-1
            text-[11px]
            font-bold
            text-slate-500
          "
        >
          Daily Summary
        </span>

      </div>


      <div className="space-y-3">
        {group.sessions?.map(
          (session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              onViewDetails={
                onViewDetails
              }
            />
          )
        )}
      </div>

    </div>
  );
};


// ============================================================
// MONTH GROUP
// ============================================================

const MonthGroup = ({
  group,
  onViewDetails,
}) => {
  return (
    <div className="space-y-3">

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <BarChart3
              size={18}
              className="text-indigo-600"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {formatMonth(group.month)}
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              {group.session_count}{" "}
              {group.session_count === 1
                ? "session"
                : "sessions"}
              {" • "}
              {formatDuration(
                group.total_duration_minutes
              )}
            </p>
          </div>

        </div>

        <span
          className="
            inline-flex
            w-fit
            items-center
            rounded-full
            border border-slate-200
            bg-slate-50
            px-3 py-1
            text-[11px]
            font-bold
            text-slate-500
          "
        >
          Monthly Summary
        </span>

      </div>


      <div className="space-y-3">
        {group.sessions?.map(
          (session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              onViewDetails={
                onViewDetails
              }
            />
          )
        )}
      </div>

    </div>
  );
};


// ============================================================
// MAIN HISTORY PAGE
// ============================================================

const History = () => {
  // ----------------------------------------------------------
  // USER
  // ----------------------------------------------------------

  const userId = useMemo(
    () => getUserId(),
    []
  );
  const [selectedSession, setSelectedSession] = useState(null);

  // ----------------------------------------------------------
  // FILTER STATE
  // ----------------------------------------------------------

  const [groupBy, setGroupBy] =
    useState("session");

  const [mode, setMode] =
    useState("");

  const [timeRange, setTimeRange] =
    useState("all");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");


  // ----------------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------------

  const [history, setHistory] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  // ----------------------------------------------------------
  // LOAD HISTORY
  // ----------------------------------------------------------
  const loadHistory = useCallback(
    async (isRefresh = false) => {
      if (!userId) {
        setLoading(false);
        setError(
          "Please log in again to access monitoring history."
        );
        return;
      }

      // Assign a unique ID to every request.
      const currentRequestId = ++requestIdRef.current;

      // Keep the existing page visible after initial loading.
      if (hasLoadedRef.current || isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await getMonitoringHistory({
          userId,
          mode: mode || undefined,
          groupBy,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        // Ignore outdated responses.
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const result = response?.data;

        if (!result?.success) {
          throw new Error(
            result?.message ||
            "Unable to load monitoring history."
          );
        }

        setHistory(result);
        hasLoadedRef.current = true;

      } catch (err) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.error("History loading error:", err);

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load monitoring history."
        );

      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [
      userId,
      mode,
      groupBy,
      startDate,
      endDate,
    ]
  );
  // ----------------------------------------------------------
  // INITIAL LOAD + FILTER CHANGE
  // ----------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300);

    return () => {
      clearTimeout(timer);

      // Prevent an older request from updating the page.
      requestIdRef.current += 1;
    };
  }, [loadHistory]);


  // ----------------------------------------------------------
  // TIME RANGE
  // ----------------------------------------------------------

  const handleTimeRangeChange = (
    value
  ) => {

    setTimeRange(value);

    if (value === "custom") {
      return;
    }

    const range =
      getDateRange(value);

    setStartDate(
      range.startDate
    );

    setEndDate(
      range.endDate
    );
  };


  // ----------------------------------------------------------
  // CLEAR FILTERS
  // ----------------------------------------------------------

  const clearFilters = () => {

    setGroupBy("session");
    setMode("");
    setTimeRange("all");
    setStartDate("");
    setEndDate("");
  };


  // ----------------------------------------------------------
  // ACTIVE FILTER COUNT
  // ----------------------------------------------------------

  const activeFilterCount =
    Number(groupBy !== "session") +
    Number(Boolean(mode)) +
    Number(Boolean(startDate || endDate));


  // ----------------------------------------------------------
  // RESULTS
  // ----------------------------------------------------------

  const summary =
    history?.summary || {};

  const results =
    Array.isArray(history?.data)
      ? history.data
      : [];


  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {

    return (
      <div className="min-h-full bg-[#f5f7fb] p-5 sm:p-6 lg:p-8">

        <div className="mx-auto flex min-h-[650px] max-w-[1600px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

              <RefreshCw
                className="h-7 w-7 animate-spin text-blue-600"
              />

            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading History Workspace
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Loading your previous monitoring sessions...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ----------------------------------------------------------
  // MAIN
  // ----------------------------------------------------------

  return (

    <div className="min-h-full bg-[#f5f7fb] p-5 text-slate-800 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-[1600px]">


        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-7">

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


            {/* TITLE */}

            <div className="flex items-center gap-4">

              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200">

                <HistoryIcon
                  className="h-7 w-7 text-white"
                  strokeWidth={2}
                />

                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-[#f5f7fb] bg-emerald-500" />

              </div>


              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    History
                  </h1>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-blue-200
                      bg-blue-50
                      px-3 py-1.5
                      text-xs
                      font-semibold
                      text-blue-700
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Historical Data
                  </span>

                </div>


                <p className="mt-1.5 text-sm text-slate-500">
                  Review previous monitoring sessions,
                  activity and captured data.
                </p>

              </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm md:flex">

                <HistoryIcon
                  size={15}
                  className="text-slate-400"
                />

                <span className="text-xs font-medium text-slate-500">
                  Historical records
                </span>

              </div>


              <button
                type="button"
                onClick={() =>
                  loadHistory(true)
                }
                disabled={refreshing}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-blue-300
                  hover:bg-blue-50
                  hover:text-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                <RefreshCw
                  className={
                    refreshing
                      ? "h-4 w-4 animate-spin"
                      : "h-4 w-4"
                  }
                />

                {refreshing
                  ? "Refreshing"
                  : "Refresh"}

              </button>

            </div>

          </div>

        </header>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">

              <Activity
                size={18}
                className="text-red-600"
              />

            </div>

            <div>

              <p className="text-sm font-bold text-red-800">
                History monitoring issue
              </p>

              <p className="mt-0.5 text-sm text-red-600">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ==================================================
            SUMMARY WORKSPACE
        ================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                <BarChart3
                  size={19}
                  className="text-blue-600"
                />

              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-900">
                  History Overview
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Summary of your monitoring activity
                </p>

              </div>

            </div>

            <span className="text-xs text-slate-400">
              Based on selected filters
            </span>

          </div>


          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">

            <div className="px-5 py-5">
              <SummaryItem
                icon={HistoryIcon}
                label="Total Sessions"
                value={formatNumber(
                  summary.total_sessions
                )}
                description="Monitoring sessions"
                iconClass="bg-blue-50 text-blue-600"
              />
            </div>


            <div className="px-5 py-5">
              <SummaryItem
                icon={Clock3}
                label="Monitoring Time"
                value={formatDuration(
                  summary.total_duration_minutes
                )}
                description="Total recorded time"
                iconClass="bg-indigo-50 text-indigo-600"
              />
            </div>


            <div className="px-5 py-5">
              <SummaryItem
                icon={Activity}
                label="Activity Records"
                value={formatNumber(
                  summary.total_activity_records
                )}
                description="Captured data points"
                iconClass="bg-emerald-50 text-emerald-600"
              />
            </div>


            <div className="px-5 py-5">
              <SummaryItem
                icon={Sparkles}
                label="AI Monitoring"
                value={formatNumber(
                  summary.ai_monitoring_sessions
                )}
                description="AI monitoring sessions"
                iconClass="bg-purple-50 text-purple-600"
              />
            </div>


            <div className="px-5 py-5">
              <SummaryItem
                icon={Database}
                label="Data Collection"
                value={formatNumber(
                  summary.data_collection_sessions
                )}
                description="Data collection sessions"
                iconClass="bg-sky-50 text-sky-600"
              />
            </div>

          </div>

        </section>


        {/* ==================================================
            FILTER WORKSPACE
        ================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* FILTER HEADER */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                <Filter
                  size={18}
                  className="text-slate-600"
                />

              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-900">
                  History Filters
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Refine how previous monitoring data is displayed.
                </p>

              </div>

            </div>


            {activeFilterCount > 0 && (

              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-semibold
                  text-blue-600
                  hover:text-blue-700
                "
              >
                <X size={13} />
                Clear filters
              </button>

            )}

          </div>


          {/* FILTER CONTROLS */}

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">


            {/* GROUP BY */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-slate-500">
                Group By
              </label>

              <div className="relative">

                <select
                  value={groupBy}
                  onChange={(e) =>
                    setGroupBy(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    px-3.5 py-2.5 pr-10
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-100
                  "
                >
                  <option value="session">
                    Session
                  </option>

                  <option value="day">
                    Day
                  </option>

                  <option value="month">
                    Month
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

            </div>


            {/* MODE */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-slate-500">
                Monitoring Mode
              </label>

              <div className="relative">

                <select
                  value={mode}
                  onChange={(e) =>
                    setMode(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    px-3.5 py-2.5 pr-10
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-100
                  "
                >
                  <option value="">
                    All Modes
                  </option>

                  <option value="AI_MONITORING">
                    AI Monitoring
                  </option>

                  <option value="DATA_COLLECTION">
                    Data Collection
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

            </div>


            {/* TIME RANGE */}

            <div>

              <label className="mb-1.5 block text-xs font-bold text-slate-500">
                Time Range
              </label>

              <div className="relative">

                <select
                  value={timeRange}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    px-3.5 py-2.5 pr-10
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    transition
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-100
                  "
                >

                  <option value="all">
                    All Time
                  </option>

                  <option value="today">
                    Today
                  </option>

                  <option value="yesterday">
                    Yesterday
                  </option>

                  <option value="7days">
                    Last 7 Days
                  </option>

                  <option value="30days">
                    Last 30 Days
                  </option>

                  <option value="thisMonth">
                    This Month
                  </option>

                  <option value="lastMonth">
                    Last Month
                  </option>

                  <option value="custom">
                    Custom Range
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

            </div>


            {/* RESULT INFO */}

            <div className="flex items-end">

              <div className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">

                <Search
                  size={17}
                  className="shrink-0 text-slate-400"
                />

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current View
                  </p>

                  <p className="truncate text-sm font-bold text-slate-700">
                    {groupBy === "session"
                      ? "Session History"
                      : groupBy === "day"
                        ? "Daily History"
                        : "Monthly History"}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* CUSTOM DATES */}

          {timeRange === "custom" && (

            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-5 py-5 sm:grid-cols-2">

              <div>

                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    px-3.5 py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>


              <div>

                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    px-3.5 py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-blue-400
                    focus:bg-white
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>

            </div>

          )}

        </section>


        {/* ==================================================
            RESULTS WORKSPACE
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


          {/* RESULTS HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">

                <HistoryIcon
                  size={18}
                  className="text-indigo-600"
                />

              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-900">

                  {groupBy === "session"
                    ? "Session History"
                    : groupBy === "day"
                      ? "Daily History"
                      : "Monthly History"}

                </h2>

                <p className="mt-0.5 text-xs text-slate-500">

                  {results.length}{" "}
                  {results.length === 1
                    ? "result"
                    : "results"}{" "}
                  found

                </p>

              </div>

            </div>


            <div className="flex items-center gap-2">

              <span className="hidden text-xs text-slate-400 sm:inline">
                Showing
              </span>

              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-2.5 py-1
                  text-[11px]
                  font-bold
                  text-slate-600
                "
              >
                {groupBy === "session"
                  ? "Sessions"
                  : groupBy === "day"
                    ? "Days"
                    : "Months"}
              </span>

            </div>

          </div>

          {refreshing && (
            <div className="flex items-center gap-2 px-5 py-2 text-xs text-blue-600">
              <RefreshCw size={13} className="animate-spin" />
              Updating monitoring history...
            </div>
          )}
          {/* RESULTS BODY */}

          <div className="p-5">


            {/* EMPTY */}

            {results.length === 0 && (

              <div className="py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">

                  <HistoryIcon
                    size={26}
                    className="text-slate-400"
                  />

                </div>

                <h3 className="mt-5 text-sm font-bold text-slate-700">
                  No Monitoring History Found
                </h3>

                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                  No monitoring sessions match
                  your current filters or date
                  range.
                </p>

                {activeFilterCount > 0 && (

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-4 py-2.5
                      text-xs
                      font-bold
                      text-white
                      transition
                      hover:bg-blue-700
                    "
                  >
                    <X size={14} />
                    Clear Filters
                  </button>

                )}

              </div>

            )}


            {/* SESSION VIEW */}

            {results.length > 0 &&
              groupBy === "session" && (

                <div className="space-y-3">

                  {results.map(
                    (session) => (

                      <SessionCard
                        key={session.session_id}
                        session={session}
                        onViewDetails={(selectedSession) =>
                          setSelectedSession(selectedSession)
                        }
                      />

                    )
                  )}

                </div>

              )}


            {/* DAY VIEW */}

            {results.length > 0 &&
              groupBy === "day" && (

                <div className="space-y-8">

                  {results.map(
                    (group) => (

                      <DayGroup
                        key={group.date}
                        group={group}
                        onViewDetails={(selectedSession) =>
                          setSelectedSession(selectedSession)
                        }
                      />

                    )
                  )}

                </div>

              )}


            {/* MONTH VIEW */}

            {results.length > 0 &&
              groupBy === "month" && (

                <div className="space-y-8">

                  {results.map(
                    (group) => (
                      <MonthGroup
                        key={group.month}
                        group={group}
                        onViewDetails={(selectedSession) =>
                          setSelectedSession(selectedSession)
                        }
                      />

                    )
                  )}

                </div>

              )}

          </div>

        </section>

      </div>
      {/* ==================================================
        SESSION DETAILS MODAL
    ================================================== */}

      {selectedSession && (
        <SessionDetails
          sessionId={selectedSession.session_id}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>

  );
};

export default History;
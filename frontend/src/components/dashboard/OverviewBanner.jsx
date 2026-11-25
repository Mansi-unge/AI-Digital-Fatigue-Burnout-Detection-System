import React from "react";
import {
  BrainCircuit,
  ShieldCheck,
  Activity,
  Clock3,
  Sparkles,
  HeartPulse,
} from "lucide-react";

import {
  timeAgo,
  computeCollectionProgress,
  DATA_COLLECTION_TARGET,
} from "../../utils/format";

const OverviewBanner = ({
  mode,
  fatigueResponse,
  isRunning,
  latest,
  recordCount,
  aiStatus,
  lastSyncAt,
  burnoutRisk,
  healthScore,
  recommendations = [],
  user,
}) => {
  // ==========================================================
  // MODE
  // ==========================================================

  const normalizedMode = String(mode || "").toLowerCase();

  const isDataCollection = normalizedMode === "data_collection";
  const isAI = normalizedMode === "ai_monitoring";
  const displayName = user?.name || "User";

  // ==========================================================
  // DATA COLLECTION PROGRESS
  // ==========================================================

  const collectionProgress = computeCollectionProgress(recordCount);

  // ==========================================================
  // AI HEALTH SCORE
  // ==========================================================

  const displayHealthScore = healthScore ?? "—";
  // ==========================================================
  // AI RECOMMENDATION
  // ==========================================================

  const latestRecommendation =
    recommendations.length > 0
      ? recommendations[0]
      : null;

  // ==========================================================
  // FATIGUE LABEL
  // ==========================================================

  const getFatigueLabel = () => {
    if (fatigueResponse === "healthy") return "Healthy";
    if (fatigueResponse === "mild") return "Mild Fatigue";
    if (fatigueResponse === "high") return "High Fatigue";

    return "Not reported yet";
  };

  // ==========================================================
  // FATIGUE STYLE
  // ==========================================================

  const getFatigueStyle = () => {
    if (fatigueResponse === "healthy") {
      return {
        card: "border-emerald-200 bg-emerald-50",
        icon: "text-emerald-600",
        text: "text-emerald-700",
      };
    }

    if (fatigueResponse === "mild") {
      return {
        card: "border-amber-200 bg-amber-50",
        icon: "text-amber-600",
        text: "text-amber-700",
      };
    }

    if (fatigueResponse === "high") {
      return {
        card: "border-red-200 bg-red-50",
        icon: "text-red-600",
        text: "text-red-700",
      };
    }

    return {
      card: "border-slate-200 bg-slate-50",
      icon: "text-slate-500",
      text: "text-slate-600",
    };
  };

  const fatigueStyle = getFatigueStyle();

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md lg:p-4">

      {/* ======================================================
          BACKGROUND ACCENTS
      ======================================================= */}

      <div
        className="
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-blue-50
          opacity-70
          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-24
          -left-20
          h-56
          w-56
          rounded-full
          bg-emerald-50
          opacity-60
          blur-3xl
        "
      />

      <div className="relative z-10">

        {/* ====================================================
            TOP SECTION
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-6
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <div className="flex-1">

            {/* WELCOME */}

            <h1
              className="
                mt-3
                text-xl
                font-bold
                tracking-tight
                text-slate-900
                lg:text-4xl
              "
            >
              Welcome Back,
              <span className="text-blue-600">
                {" "}{displayName}
              </span>
            </h1>

            {/* MODE DESCRIPTION */}

            <p
              className="
                mt-3
                max-w-2xl
                text-base
                leading-relaxed
                text-slate-500
                lg:text-md
              "
            >
              {isDataCollection
                ? "Your activity, attention, environment, and fatigue responses are being collected to build your personalized fatigue dataset."
                : "Your workspace is being monitored in real time. VitaSense is analyzing your activity, attention, environment, and fatigue indicators."
              }
            </p>

            {/* =================================================
                DATA COLLECTION PROGRESS — DATA COLLECTION ONLY
            ================================================== */}

            {isDataCollection && (
              <div className="mt-4 max-w-2xl">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm font-medium text-slate-600">
                    Data Collection Progress
                  </span>

                  <span className="text-sm font-bold text-emerald-600">
                    {collectionProgress}%
                  </span>

                </div>

                <div
                  className="
                    h-2.5
                    w-full
                    overflow-hidden
                    rounded-full
                    bg-slate-100
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-emerald-500
                      to-blue-600
                      transition-all
                      duration-1000
                    "
                    style={{
                      width: `${collectionProgress}%`,
                    }}
                  />
                </div>

                <div
                  className="
                    mt-2
                    flex
                    justify-between
                    text-xs
                    text-slate-400
                  "
                >
                  <span>
                    {isRunning
                      ? "Collecting data"
                      : "Paused"
                    }
                  </span>

                  <span>
                    {recordCount || 0} / {DATA_COLLECTION_TARGET} records
                  </span>
                </div>

              </div>
            )}

            {/* =================================================
                AI HEALTH SCORE — AI MODE ONLY
            ================================================== */}

            {isAI && (
              <div className="mt-7 max-w-2xl">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-sm font-medium text-slate-600">
                    Overall Health Score
                  </span>

                  <span className="text-sm font-bold text-emerald-600">
                    {displayHealthScore}%
                  </span>

                </div>

                <div
                  className="
                    h-2.5
                    w-full
                    overflow-hidden
                    rounded-full
                    bg-slate-100
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-emerald-500
                      to-blue-600
                      transition-all
                      duration-1000
                    "
                    style={{
                      width: `${displayHealthScore === "—" ? 0 : displayHealthScore}%`,
                    }}
                  />
                </div>

                <div
                  className="
                    mt-2
                    flex
                    justify-between
                    text-xs
                    text-slate-400
                  "
                >
                  <span>
                    Needs Attention
                  </span>

                  <span>
                    Healthy
                  </span>
                </div>

              </div>
            )}

          </div>

          {/* ==================================================
              STATUS CARDS
          ================================================== */}

          <div
            className="
              grid
              shrink-0
              grid-cols-2
              gap-3
              sm:gap-4
              xl:w-[390px]
            "
          >

            {/* =================================================
                MONITORING — SHARED
            ================================================== */}

            <div
              className={`
                rounded-2xl
                border
                p-4
                transition-all
                duration-200
                hover:shadow-sm
                ${isRunning
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
                }
              `}
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-emerald-100
                    bg-white
                  "
                >
                  <Activity
                    size={20}
                    className={
                      isRunning
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }
                  />
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Monitoring
                  </p>

                  <h3
                    className={`
                      mt-0.5
                      text-sm
                      font-bold
                      ${isRunning
                        ? "text-emerald-700"
                        : "text-slate-500"
                      }
                    `}
                  >
                    {isRunning ? "Active" : "Inactive"}
                  </h3>

                </div>

              </div>

            </div>

            {/* =================================================
                DATA COLLECTION — CURRENT FATIGUE
            ================================================== */}

            {isDataCollection && (
              <div
                className={`
                  rounded-2xl
                  border
                  p-4
                  transition-all
                  duration-200
                  hover:shadow-sm
                  ${fatigueStyle.card}
                `}
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-100
                      bg-white
                    "
                  >
                    <HeartPulse
                      size={20}
                      className={fatigueStyle.icon}
                    />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Current Fatigue
                    </p>

                    <h3
                      className={`
                        mt-0.5
                        text-sm
                        font-bold
                        ${fatigueStyle.text}
                      `}
                    >
                      {getFatigueLabel()}
                    </h3>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                AI — AI STATUS
            ================================================== */}

            {isAI && (
              <div
                className="
                  rounded-2xl
                  border
                  border-blue-200
                  bg-blue-50
                  p-4
                  transition-all
                  duration-200
                  hover:shadow-sm
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-blue-100
                      bg-white
                    "
                  >
                    <BrainCircuit
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      AI Status
                    </p>

                    <h3 className="mt-0.5 text-sm font-bold text-blue-700">
                      {aiStatus || "Normal"}
                    </h3>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                DATA COLLECTION — DATA COLLECTION STATUS
            ================================================== */}

            {isDataCollection && (
              <div
                className={`
                  rounded-2xl
                  border
                  p-4
                  transition-all
                  duration-200
                  hover:shadow-sm
                  ${isRunning
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                  }
                `}
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-blue-100
                      bg-white
                    "
                  >
                    <Activity
                      size={20}
                      className={
                        isRunning
                          ? "text-blue-600"
                          : "text-slate-400"
                      }
                    />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Data Collection
                    </p>

                    <h3
                      className={`
                        mt-0.5
                        text-sm
                        font-bold
                        ${isRunning
                          ? "text-blue-700"
                          : "text-slate-500"
                        }
                      `}
                    >
                      {isRunning ? "Active" : "Inactive"}
                    </h3>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                AI — BURNOUT RISK
            ================================================== */}

            {isAI && (
              <div
                className="
                  rounded-2xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-4
                  transition-all
                  duration-200
                  hover:shadow-sm
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-amber-100
                      bg-white
                    "
                  >
                    <ShieldCheck
                      size={20}
                      className="text-amber-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Burnout Risk
                    </p>

                    <h3 className="mt-0.5 text-sm font-bold text-amber-700">
                      {burnoutRisk || "Low"}
                    </h3>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                LAST SYNC — SHARED
            ================================================== */}

            <div
              className="
                rounded-2xl
                border
                border-cyan-200
                bg-cyan-50
                p-4
                transition-all
                duration-200
                hover:shadow-sm
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-100
                    bg-white
                  "
                >
                  <Clock3
                    size={20}
                    className="text-cyan-600"
                  />
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Last Sync
                  </p>

                  <h3 className="mt-0.5 text-sm font-bold text-cyan-700">
                    {timeAgo(lastSyncAt)}
                  </h3>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            DATA COLLECTION INFORMATION
            DATA COLLECTION ONLY
        ===================================================== */}

        {isDataCollection && (
          <div
            className="
              mt-4
              flex
              flex-col
              gap-3
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50/70
              px-2
              py-2
              sm:flex-row
              sm:items-center
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-100
                bg-white
              "
            >
              <HeartPulse
                size={18}
                className="text-emerald-600"
              />
            </div>

            <p className="text-sm leading-relaxed text-slate-600">

              <span className="font-semibold text-slate-800">
                Fatigue Self-Report:
              </span>

              {" "}

              {fatigueResponse
                ? `Your latest reported level is ${getFatigueLabel()}.`
                : "You will be asked periodically how you are feeling to help build the fatigue dataset."
              }

            </p>

          </div>
        )}
        {/* ====================================================
    AI RECOMMENDATION
    AI MODE ONLY
===================================================== */}

        {isAI && (
          <div
            className="
      mt-7
      flex
      flex-col
      gap-3
      rounded-2xl
      border
      border-blue-100
      bg-blue-50/70
      px-5
      py-4
      sm:flex-row
      sm:items-center
    "
          >
            <div
              className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-blue-100
        bg-white
      "
            >
              <Sparkles
                size={18}
                className="text-blue-600"
              />
            </div>

            <div className="text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-800">
                AI Recommendation:
              </span>

              {" "}

              {latestRecommendation ? (
                <>
                  {latestRecommendation.message}

                  <div className="mt-1 flex gap-2 text-xs">
                    <span className="font-semibold text-blue-600">
                      {latestRecommendation.type}
                    </span>

                    <span className="text-slate-400">
                      Priority: {latestRecommendation.priority}
                    </span>
                  </div>
                </>
              ) : (
                <span className="ml-1">
                  No recommendation available yet.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

    </section>
  );
};

export default OverviewBanner;
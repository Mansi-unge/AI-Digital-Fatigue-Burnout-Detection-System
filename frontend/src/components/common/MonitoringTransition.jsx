import React from "react";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  X,
  CircleMinus,
  AlertCircle,
} from "lucide-react";

// ==========================================================
// GET STEP STATUS LABEL
// ==========================================================

const getStepStatusText = (phase, status) => {
  if (status === "completed") {
    return phase === "starting" ? "Started" : "Completed";
  }

  if (status === "in_progress") {
    return phase === "starting" ? "Initializing" : "In progress";
  }

  if (status === "skipped") {
    return "Skipped";
  }

  if (status === "error") {
    return "Failed";
  }

  return "Pending";
};

// ==========================================================
// GET STEP STATUS ICON
// ==========================================================

const StepStatusIcon = ({ status, transitionPhase }) => {
  if (status === "completed") {
    return (
      <CheckCircle2
        size={17}
        className="shrink-0 text-emerald-600"
      />
    );
  }

  if (status === "in_progress") {
    return (
      <Loader2
        size={17}
        className={`shrink-0 animate-spin ${transitionPhase === "starting"
            ? "text-blue-600"
            : "text-red-600"
          }`}
      />
    );
  }

  if (status === "skipped") {
    return (
      <CircleMinus
        size={17}
        className="shrink-0 text-slate-500"
      />
    );
  }

  if (status === "error") {
    return (
      <AlertCircle
        size={17}
        className="shrink-0 text-red-600"
      />
    );
  }

  return (
    <Clock3
      size={17}
      className="shrink-0 text-slate-400"
    />
  );
};

// ==========================================================
// GET STEP STATUS STYLE
// ==========================================================

const getStatusStyle = (status, transitionPhase) => {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "in_progress") {
    return transitionPhase === "starting"
      ? "bg-blue-50 text-blue-700"
      : "bg-red-50 text-red-700";
  }

  if (status === "skipped") {
    return "bg-slate-100 text-slate-600";
  }

  if (status === "error") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-500";
};

// ==========================================================
// MONITORING TRANSITION COMPONENT
// ==========================================================

const MonitoringTransition = ({
  transitionPhase,
  progressSteps = [],
  statusBannerMessage,
  onDismiss,
}) => {
  const isProgressOpen =
    transitionPhase === "starting" ||
    transitionPhase === "stopping";

  const isSuccessBannerOpen =
    transitionPhase === "started_success" ||
    transitionPhase === "stopped_success";

  const completedCount = progressSteps.filter(
    (step) =>
      step.status === "completed" ||
      step.status === "skipped"
  ).length;

  const errorCount = progressSteps.filter(
    (step) => step.status === "error"
  ).length;

  const totalSteps = progressSteps.length;

  const progressPercentage = totalSteps
    ? Math.round((completedCount / totalSteps) * 100)
    : 0;

  if (!isProgressOpen && !isSuccessBannerOpen) {
    return null;
  }

  return (
    <>
      {/* ================================================== */}
      {/* PROGRESS MODAL */}
      {/* ================================================== */}

      {isProgressOpen && (
        <div
          role="dialog"
          aria-live="polite"
          aria-modal="true"
          aria-labelledby="monitoring-transition-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[1px]"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Loader2
                  size={20}
                  className={`shrink-0 animate-spin ${transitionPhase === "starting"
                      ? "text-blue-600"
                      : "text-red-600"
                    }`}
                />

                <h2
                  id="monitoring-transition-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {transitionPhase === "starting"
                    ? "Starting VitaSense Monitoring"
                    : "Stopping VitaSense Monitoring"}
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {completedCount}/{totalSteps}
              </span>
            </div>

            {/* DESCRIPTION */}

            <p className="mt-1.5 text-sm text-slate-500">
              {transitionPhase === "starting"
                ? "Initializing monitoring services and session."
                : "Saving session records and shutting down monitoring services."}
            </p>

            {/* ERROR SUMMARY */}

            {errorCount > 0 && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {errorCount} monitoring step
                {errorCount > 1 ? "s have" : " has"} failed.
              </p>
            )}

            {/* PROGRESS BAR */}

            <div
              className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full transition-all duration-300 ${transitionPhase === "starting"
                    ? "bg-blue-600"
                    : "bg-red-600"
                  }`}
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            {/* PROGRESS STEPS */}

            <ul className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5">
              {progressSteps.map((step) => {
                const status = step.status || "pending";

                const statusLabel = getStepStatusText(
                  transitionPhase,
                  status
                );

                return (
                  <li
                    key={step.id}
                    className="flex items-start justify-between gap-3 py-3 text-sm"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="mt-0.5">
                        <StepStatusIcon
                          status={status}
                          transitionPhase={transitionPhase}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`truncate ${status === "pending"
                              ? "text-slate-500"
                              : status === "error"
                                ? "font-medium text-red-700"
                                : "font-medium text-slate-800"
                            }`}
                        >
                          {step.label}
                        </p>

                        {step.message && (
                          <p
                            className={`mt-0.5 break-words text-xs ${status === "error"
                                ? "text-red-600"
                                : "text-slate-500"
                              }`}
                          >
                            {step.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${getStatusStyle(
                        status,
                        transitionPhase
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SUCCESS TOAST */}
      {/* ================================================== */}

      {isSuccessBannerOpen && statusBannerMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-md items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3.5 text-slate-800 shadow-lg"
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div className="flex-1 text-sm">
            <p className="font-semibold text-slate-900">
              {transitionPhase === "started_success"
                ? "Monitoring Started"
                : "Monitoring Stopped"}
            </p>

            <p className="mt-0.5 text-slate-600">
              {statusBannerMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
};

export default MonitoringTransition;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  CalendarDays,
  Activity,
  Keyboard,
  Mouse,
  Monitor,
  Camera,
  Eye,
  Smile,
  Move3D,
  Thermometer,
  Droplets,
  Sun,
  Ruler,
  Radio,
  Battery,
  Zap,
  BrainCircuit,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  FileText,
  AppWindow,
  RefreshCw,
  Download,
} from "lucide-react";

import {
  getMonitoringSessionDetails,
  getMonitoringData,
} from "../../api/monitoringApi";


/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
      <Icon size={20} className="text-blue-600" strokeWidth={2.1} />
    </div>

    <div>
      <h2 className="text-base font-semibold text-slate-900">
        {title}
      </h2>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);


const Metric = ({ icon: Icon, label, value, unit = "" }) => (
  <div className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 transition hover:border-blue-200 hover:shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      {Icon && (
        <Icon
          size={17}
          className="text-slate-500 group-hover:text-blue-600 transition-colors"
          strokeWidth={2}
        />
      )}

      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>
    </div>

    <div className="text-lg font-semibold text-slate-900">
      {value ?? "—"}
      {unit && value !== null && value !== undefined && (
        <span className="text-xs font-medium text-slate-500 ml-1">
          {unit}
        </span>
      )}
    </div>
  </div>
);


const StatusBadge = ({ children, type = "neutral" }) => {
  const styles = {
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200",

    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    ai:
      "bg-violet-50 text-violet-700 border-violet-200",

    data:
      "bg-blue-50 text-blue-700 border-blue-200",

    high:
      "bg-red-50 text-red-700 border-red-200",

    medium:
      "bg-amber-50 text-amber-700 border-amber-200",

    low:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    poor:
      "bg-red-50 text-red-700 border-red-200",

    moderate:
      "bg-amber-50 text-amber-700 border-amber-200",

    good:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${styles[type] || styles.neutral
        }`}
    >
      {children}
    </span>
  );
};



const DetailCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  iconClass = "bg-blue-50 text-blue-600",
  className = "",
}) => (
  <section
    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] ${className}`}
  >
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={19} strokeWidth={2.1} />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
    <div className="p-5 lg:p-6">{children}</div>
  </section>
);

const ScoreCard = ({
  icon: Icon,
  title,
  score,
  level,
  tone = "violet",
  description,
}) => {
  const tones = {
    violet: {
      shell: "border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-white",
      icon: "bg-violet-100 text-violet-600",
      score: "text-violet-700",
      bar: "bg-violet-500",
    },
    amber: {
      shell: "border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-white",
      icon: "bg-amber-100 text-amber-600",
      score: "text-amber-700",
      bar: "bg-amber-500",
    },
    emerald: {
      shell: "border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white",
      icon: "bg-emerald-100 text-emerald-600",
      score: "text-emerald-700",
      bar: "bg-emerald-500",
    },
  };

  const t = tones[tone] || tones.violet;
  const numericScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className={`rounded-2xl border p-5 ${t.shell}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}>
            <Icon size={18} strokeWidth={2.1} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-[11px] text-slate-500">Session assessment</p>
          </div>
        </div>
        <StatusBadge type={getRiskType(level)}>
          {level || "—"}
        </StatusBadge>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <span className={`text-3xl font-extrabold tracking-tight ${t.score}`}>
            {score ?? "—"}
          </span>
          <span className="ml-1 text-xs font-medium text-slate-400">/100</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {description}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${t.bar} transition-all duration-500`}
          style={{ width: `${numericScore}%` }}
        />
      </div>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return number.toFixed(decimals);
};


const getModeLabel = (mode) => {
  if (mode === "AI_MONITORING") {
    return "AI Monitoring";
  }

  if (mode === "DATA_COLLECTION") {
    return "Data Collection";
  }

  return mode || "Unknown";
};


const getModeType = (mode) => {
  if (mode === "AI_MONITORING") {
    return "ai";
  }

  if (mode === "DATA_COLLECTION") {
    return "data";
  }

  return "neutral";
};


const getRiskType = (level) => {
  if (!level) return "neutral";

  const normalized = String(level).toLowerCase();

  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  if (normalized === "low") return "low";

  if (normalized === "poor") return "poor";
  if (normalized === "moderate") return "moderate";
  if (normalized === "good") return "good";

  return "neutral";
};


const displayValue = (value, suffix = "") => {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return `${value}${suffix}`;
};


/* =========================================================
   MAIN PAGE
========================================================= */

const SessionDetails = ({
  sessionId: sessionIdProp,
  onClose,
}) => {
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();

  const sessionId = sessionIdProp || routeSessionId;

  const closeModal = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/history");
    }
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  /* =======================================================
     GET USER ID
  ======================================================= */

  const getUserId = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        return (
          user?.id ||
          user?.user_id ||
          user?.userId ||
          null
        )
      }
    } catch (error) {
      console.error("Unable to read stored user:", error);
    }

    const directUserId =
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id");

    return directUserId || null;
  };


  /* =======================================================
     LOAD SESSION DETAILS
  ======================================================= */

  const loadSessionDetails = async (showRefresh = false) => {
    const userId = getUserId();

    if (!userId) {
      setError("Your user session could not be found.");
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError("Session ID is missing.");
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getMonitoringSessionDetails(
        userId,
        sessionId
      );

      if (response?.data?.success) {
        setData(response.data);
      } else {
        setError(
          response?.data?.message ||
          "Unable to load session details."
        );
      }
    } catch (err) {
      console.error("Session details error:", err);

      setError(
        "We couldn't load this session. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  // =======================================================
  // DOWNLOAD SESSION CSV
  // =======================================================

  const downloadSessionCSV = async () => {
    const userId = getUserId();

    if (!userId || !sessionId) {
      return;
    }

    try {
      const response = await getMonitoringData(
        userId,
        sessionId
      );

      const records = Array.isArray(
        response?.data?.data
      )
        ? response.data.data
        : [];

      if (records.length === 0) {
        window.alert(
          "No activity data is available for this session."
        );
        return;
      }

      // ---------------------------------------------------
      // CSV COLUMNS
      // ---------------------------------------------------

      const columns = [
        "id",
        "user_id",
        "session_id",

        // Desktop Activity
        "screen_time",
        "active_time",
        "idle_time",
        "keyboard_count",
        "mouse_clicks",
        "scroll_count",
        "active_application",
        "application_switches",

        // Camera
        "blink_rate",
        "eye_closure",
        "yawn_count",
        "head_pose",

        // Environment / IoT
        "temperature",
        "humidity",
        "light",
        "distance",
        "motion",

        // System
        "brightness",
        "battery_percentage",
        "charging_status",

        // Timestamp
        "created_at",
      ];

      // ---------------------------------------------------
      // CSV ESCAPING
      // ---------------------------------------------------

      const escapeCSV = (value) => {
        if (
          value === null ||
          value === undefined
        ) {
          return "";
        }

        const text = String(value);

        if (
          text.includes(",") ||
          text.includes("\"") ||
          text.includes("\n") ||
          text.includes("\r")
        ) {
          return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
      };

      // ---------------------------------------------------
      // HEADER
      // ---------------------------------------------------

      const header = columns.join(",");

      // ---------------------------------------------------
      // ROWS
      // ---------------------------------------------------

      const rows = records.map((record) =>
        columns
          .map((column) =>
            escapeCSV(record?.[column])
          )
          .join(",")
      );

      // ---------------------------------------------------
      // CREATE CSV
      // ---------------------------------------------------

      const csvContent = [
        header,
        ...rows,
      ].join("\r\n");

      // BOM helps Excel correctly recognize UTF-8
      const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const datePart = session?.started_at
        ? new Date(session.started_at)
          .toISOString()
          .slice(0, 10)
        : "session";

      link.download =
        `VitaSense_Session_${sessionId}_${datePart}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "CSV download error:",
        error
      );

      window.alert(
        "Unable to download the session CSV. Please try again."
      );
    }
  };

  const downloadSessionPDF = () => {
    if (!sessionId || !data) {
      window.alert("Session data is not available.");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const sessionData = session || {};
      const activityData = activity || {};
      const cameraData = camera || {};
      const environmentData = environment || {};
      const systemData = system || {};
      const fatigueData = fatigueReport || {};

      const fatigueDataAI = fatigue || {};
      const burnoutDataAI = burnout || {};
      const healthDataAI = health || {};

      const generatedAt = new Date();

      const formatPDFDate = (value) => {
        if (!value) return "N/A";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return "N/A";
        }

        return date.toLocaleString();
      };

      const formatPDFValue = (value, suffix = "") => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return "N/A";
        }

        return `${value}${suffix}`;
      };

      const addPageFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);

          doc.setDrawColor(226, 232, 240);
          doc.line(
            15,
            pageHeight - 14,
            pageWidth - 15,
            pageHeight - 14
          );

          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);

          doc.text(
            "VitaSense • Digital Fatigue & Burnout Monitoring System",
            15,
            pageHeight - 8
          );

          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - 15,
            pageHeight - 8,
            { align: "right" }
          );
        }
      };

      const addSectionTitle = (
        title,
        subtitle = ""
      ) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);

        doc.text(title, 15, currentY);

        currentY += 6;

        if (subtitle) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);

          doc.text(subtitle, 15, currentY);

          currentY += 5;
        }

        currentY += 2;
      };

      let currentY = 20;

      // =========================================================
      // HEADER
      // =========================================================

      doc.setFillColor(239, 246, 255);

      doc.roundedRect(
        15,
        15,
        pageWidth - 30,
        35,
        5,
        5,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 64, 175);

      doc.text(
        "VitaSense",
        22,
        27
      );

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      doc.text(
        "Digital Fatigue & Burnout Monitoring Report",
        22,
        34
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      doc.text(
        `Session #${sessionData.id || sessionId}`,
        pageWidth - 22,
        27,
        { align: "right" }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `Generated: ${formatPDFDate(generatedAt)}`,
        pageWidth - 22,
        34,
        { align: "right" }
      );

      currentY = 60;

      // =========================================================
      // SESSION OVERVIEW
      // =========================================================

      addSectionTitle(
        "Session Overview",
        "Monitoring session information"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Field",
            "Value",
          ],
        ],
        body: [
          [
            "Session ID",
            formatPDFValue(sessionData.id || sessionId),
          ],
          [
            "Monitoring Mode",
            getModeLabel(sessionData.mode),
          ],
          [
            "Started At",
            formatPDFDate(sessionData.started_at),
          ],
          [
            "Ended At",
            formatPDFDate(sessionData.ended_at),
          ],
          [
            "Duration",
            formatPDFValue(
              sessionData.duration
            ),
          ],
          [
            "Status",
            sessionData.is_active
              ? "Active"
              : "Completed",
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 10;

      // =========================================================
      // DESKTOP ACTIVITY
      // =========================================================

      addSectionTitle(
        "Desktop Activity",
        "Behavioural activity captured during the session"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Metric",
            "Value",
          ],
        ],
        body: [
          [
            "Screen Time",
            formatPDFValue(
              activityData.screen_time,
              " sec"
            ),
          ],
          [
            "Active Time",
            formatPDFValue(
              activityData.active_time,
              " sec"
            ),
          ],
          [
            "Idle Time",
            formatPDFValue(
              activityData.idle_time,
              " sec"
            ),
          ],
          [
            "Keyboard Count",
            formatPDFValue(
              activityData.keyboard_count
            ),
          ],
          [
            "Mouse Clicks",
            formatPDFValue(
              activityData.mouse_clicks
            ),
          ],
          [
            "Scroll Count",
            formatPDFValue(
              activityData.scroll_count
            ),
          ],
          [
            "Active Application",
            formatPDFValue(
              activityData.active_application
            ),
          ],
          [
            "Application Switches",
            formatPDFValue(
              activityData.application_switches
            ),
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 10;

      // =========================================================
      // CAMERA MONITORING
      // =========================================================

      addSectionTitle(
        "Camera Monitoring",
        "Visual attention and fatigue-related indicators"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Metric",
            "Value",
          ],
        ],
        body: [
          [
            "Blink Rate",
            formatPDFValue(
              cameraData.blink_rate,
              " /min"
            ),
          ],
          [
            "Eye Closure",
            formatPDFValue(
              cameraData.eye_closure,
              " %"
            ),
          ],
          [
            "Yawn Count",
            formatPDFValue(
              cameraData.yawn_count
            ),
          ],
          [
            "Head Pose",
            formatPDFValue(
              cameraData.head_pose
            ),
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 10;

      // =========================================================
      // ENVIRONMENT
      // =========================================================

      addSectionTitle(
        "Environment",
        "IoT-based workplace environmental measurements"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Parameter",
            "Value",
          ],
        ],
        body: [
          [
            "Temperature",
            formatPDFValue(
              environmentData.temperature,
              " °C"
            ),
          ],
          [
            "Humidity",
            formatPDFValue(
              environmentData.humidity,
              " %"
            ),
          ],
          [
            "Ambient Light",
            formatPDFValue(
              environmentData.light,
              " lux"
            ),
          ],
          [
            "Distance",
            formatPDFValue(
              environmentData.distance,
              " cm"
            ),
          ],
          [
            "Motion",
            environmentData.motion === null ||
              environmentData.motion === undefined
              ? "N/A"
              : environmentData.motion
                ? "Detected"
                : "Not Detected",
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 10;

      // =========================================================
      // SYSTEM STATUS
      // =========================================================

      addSectionTitle(
        "System Status",
        "Device and workstation status"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Parameter",
            "Value",
          ],
        ],
        body: [
          [
            "Brightness",
            formatPDFValue(
              systemData.brightness,
              " %"
            ),
          ],
          [
            "Battery",
            formatPDFValue(
              systemData.battery_percentage,
              " %"
            ),
          ],
          [
            "Charging Status",
            systemData.charging_status
              ? "Charging"
              : "Not Charging",
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [71, 85, 105],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 10;

      // =========================================================
      // FATIGUE SELF REPORT
      // =========================================================

      addSectionTitle(
        "Fatigue Self-Report",
        "Fatigue level reported by the user during the session"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Field",
            "Value",
          ],
        ],
        body: [
          [
            "Reported Fatigue Level",
            formatPDFValue(
              fatigueData.level
            ),
          ],
          [
            "Reported At",
            formatPDFDate(
              fatigueData.reported_at
            ),
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 10;

      // =========================================================
      // AI ANALYSIS
      // =========================================================

      addSectionTitle(
        "AI Analysis",
        "Fatigue, burnout and health indicators generated for the session"
      );

      autoTable(doc, {
        startY: currentY,
        margin: {
          left: 15,
          right: 15,
        },
        theme: "grid",
        head: [
          [
            "Analysis",
            "Score",
            "Level",
          ],
        ],
        body: [
          [
            "Fatigue",
            formatPDFValue(
              fatigueDataAI.score
            ),
            formatPDFValue(
              fatigueDataAI.level
            ),
          ],
          [
            "Burnout",
            formatPDFValue(
              burnoutDataAI.score
            ),
            formatPDFValue(
              burnoutDataAI.level
            ),
          ],
          [
            "Health",
            formatPDFValue(
              healthDataAI.score
            ),
            formatPDFValue(
              healthDataAI.level
            ),
          ],
        ],
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [124, 58, 237],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      currentY =
        doc.lastAutoTable.finalY + 12;

      // =========================================================
      // REPORT NOTE
      // =========================================================

      doc.setFillColor(248, 250, 252);

      doc.roundedRect(
        15,
        currentY,
        pageWidth - 30,
        22,
        4,
        4,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      doc.text(
        "Report Information",
        20,
        currentY + 7
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);

      const note =
        "This report summarizes monitoring data captured during the selected VitaSense session.";

      const wrappedNote = doc.splitTextToSize(
        note,
        pageWidth - 45
      );

      doc.text(
        wrappedNote,
        20,
        currentY + 13
      );

      // =========================================================
      // FOOTER
      // =========================================================

      addPageFooter();

      // =========================================================
      // SAVE
      // =========================================================

      const datePart = sessionData.started_at
        ? new Date(sessionData.started_at)
          .toISOString()
          .slice(0, 10)
        : "session";

      doc.save(
        `VitaSense_Session_${sessionId}_${datePart}.pdf`
      );

    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      window.alert(
        "Unable to generate the session PDF. Please try again."
      );
    }
  };
  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-slate-900/15 backdrop-blur-[1px]"
          onClick={closeModal}
        />

        <div
          className="
            relative
            w-[97vw]
sm:w-[94vw]
lg:w-[88vw]
xl:w-[86vw]
h-[92vh]
sm:h-[90vh]
lg:h-[88vh]
xl:h-[86vh]
            bg-slate-50
            rounded-3xl
            border border-slate-200
            shadow-[0_30px_90px_rgba(15,23,42,0.20)]
            overflow-hidden
            flex flex-col
          "
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 bg-white border-b border-slate-200 px-5 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  title="Close"
                >
                  <ArrowLeft size={19} strokeWidth={2.2} />
                </button>

                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Session Details
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Preparing your monitoring session report...
                  </p>
                </div>
              </div>

              <RefreshCw
                size={18}
                className="text-slate-400 animate-spin"
              />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                <RefreshCw
                  size={23}
                  className="text-slate-600 animate-spin"
                />
              </div>

              <h2 className="text-base font-semibold text-slate-900">
                Loading Session Details
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Preparing your monitoring session report...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-slate-900/15 backdrop-blur-[1px]"
          onClick={closeModal}
        />

        <div
          className="
            relative
            w-[97vw]
sm:w-[94vw]
lg:w-[88vw]
xl:w-[86vw]
h-[92vh]
sm:h-[90vh]
lg:h-[88vh]
xl:h-[86vh]
            bg-slate-50
            rounded-3xl
            border border-slate-200
            shadow-[0_25px_80px_rgba(15,23,42,0.18)]
            overflow-hidden
            flex flex-col
          "
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 bg-white border-b border-slate-200 px-5 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                title="Back to History"
              >
                <ArrowLeft size={19} strokeWidth={2.2} />
              </button>

              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Session Details
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Unable to load the selected monitoring session.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-7 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle
                  size={23}
                  className="text-red-500"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Session Details Unavailable
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                {error || "The requested session could not be loaded."}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Back to History
                </button>

                <button
                  onClick={() => loadSessionDetails()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  /* =======================================================
     DATA
  ======================================================= */

  const session = data.session || {};
  const activity = data.activity || {};
  const camera = data.camera || {};
  const environment = data.environment || {};
  const system = data.system || {};
  const ai = data.ai_analysis || {};
  const fatigueReport = data.fatigue_report || {};

  const prediction = ai.prediction || {};

  const fatigue = prediction.fatigue || {};
  const burnout = prediction.burnout || {};
  const health = prediction.health || {};


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">

      {/* =====================================================
        LIGHT BACKDROP
    ===================================================== */}

      <div
        className="absolute inset-0 bg-slate-900/15 backdrop-blur-[1px]"
        onClick={closeModal}
      />

      {/* =====================================================
        SESSION DETAILS MODAL
    ===================================================== */}

      <div
        className="
        relative
        w-[97vw]
sm:w-[94vw]
lg:w-[88vw]
xl:w-[86vw]
h-[92vh]
sm:h-[90vh]
lg:h-[88vh]
xl:h-[86vh]
        bg-[#f7f9fc]
        rounded-3xl
        border border-slate-200
        shadow-[0_25px_80px_rgba(15,23,42,0.18)]
        overflow-hidden
        flex flex-col
      "
        onClick={(event) => event.stopPropagation()}
      >

        {/* ===================================================
          TOP HEADER
      =================================================== */}

        <div className="shrink-0 z-20 bg-gradient-to-r from-white via-white to-blue-50/50 backdrop-blur-md border-b border-slate-200">

          <div className="w-full px-5 lg:px-6 py-4">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  title="Back to History"
                >
                  <ArrowLeft size={19} strokeWidth={2.2} />
                </button>

                <div>

                  <div className="flex items-center gap-2">

                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                      Session Details
                    </h1>

                    <span className="text-sm text-slate-400">
                      #{session.session_id}
                    </span>

                  </div>

                  <p className="text-sm text-slate-500 mt-0.5">
                    Detailed monitoring report for{" "}
                    {formatDate(session.started_at)}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <span className={`h-2 w-2 rounded-full ${session.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {session.is_active ? "Live session" : "Completed"}
                  </span>
                </div>

                <StatusBadge type={getModeType(session.mode)}>
                  {getModeLabel(session.mode)}
                </StatusBadge>

                {/* DOWNLOAD CSV */}

                <button
                  type="button"
                  onClick={downloadSessionCSV}
                  className="
    inline-flex
    h-10
    items-center
    gap-2
    rounded-xl
    border
    border-blue-200
    bg-blue-50
    px-3
    text-blue-600
    transition
    hover:bg-blue-100
    hover:border-blue-300
  "
                  title="Download CSV"
                >
                  <Download
                    size={17}
                    strokeWidth={2.1}
                  />

                  <span className="hidden sm:inline text-xs font-semibold">
                    CSV
                  </span>
                </button>

                <button
                  type="button"
                  onClick={downloadSessionPDF}
                  className="
    inline-flex
    h-10
    items-center
    gap-2
    rounded-xl
    border
    border-violet-200
    bg-violet-50
    px-3
    text-violet-600
    transition
    hover:bg-violet-100
    hover:border-violet-300
  "
                  title="Download PDF Report"
                >
                  <FileText
                    size={17}
                    strokeWidth={2.1}
                  />

                  <span className="hidden sm:inline text-xs font-semibold">
                    PDF
                  </span>
                </button>

                {/* REFRESH */}

                <button
                  onClick={() => loadSessionDetails(true)}
                  disabled={refreshing}
                  className="
                  w-10
                  h-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  flex
                  items-center
                  justify-center
                  text-slate-600
                  hover:bg-slate-50
                  transition
                  disabled:opacity-50
                "
                  title="Refresh"
                >
                  <RefreshCw
                    size={17}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
          MAIN CONTENT
      =================================================== */}

        <main className="flex-1 min-h overflow-y-auto overflow-x-hidden w-full px-4 sm:px-5 lg:px-6 py-5 lg:py-6">

          <div className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                  Monitoring Report
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  A consolidated view of activity, camera, environment, system and AI data.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Session #{session.session_id}
              </div>
            </div>
          </div>

          {/* =================================================
            SESSION OVERVIEW
        ================================================= */}

          <DetailCard
            icon={CalendarDays}
            title="Session Overview"
            subtitle="Monitoring session information and duration"
            iconClass="bg-blue-50 text-blue-600"
            className="mb-5"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <Metric
                icon={CalendarDays}
                label="Session Date"
                value={formatDate(session.started_at)}
              />

              <Metric
                icon={Clock3}
                label="Duration"
                value={session.duration_formatted || "—"}
              />

              <Metric
                icon={Activity}
                label="Activity Records"
                value={activity.record_count ?? 0}
              />

              <Metric
                icon={CheckCircle2}
                label="Session Status"
                value={session.is_active ? "Active" : "Completed"}
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

              <div className="p-4 rounded-xl border border-slate-200">

                <p className="text-xs text-slate-500 mb-1">
                  Started
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {formatDateTime(session.started_at)}
                </p>

              </div>


              <div className="p-4 rounded-xl border border-slate-200">

                <p className="text-xs text-slate-500 mb-1">
                  Ended
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {formatDateTime(session.ended_at)}
                </p>

              </div>


              <div className="p-4 rounded-xl border border-slate-200">

                <p className="text-xs text-slate-500 mb-1">
                  Last Data Sync
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {formatDateTime(session.last_sync_at)}
                </p>

              </div>

            </div>

          </DetailCard>


          {/* =================================================
            ACTIVITY
        ================================================= */}

          <DetailCard
            icon={Activity}
            title="Desktop Activity"
            subtitle="Behavioural activity recorded during this session"
            iconClass="bg-emerald-50 text-emerald-600"
            className="mb-6"
          >

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

              <Metric
                icon={Monitor}
                label="Screen Time"
                value={formatNumber(activity.screen_time, 1)}
                unit="sec"
              />

              <Metric
                icon={Clock3}
                label="Active Time"
                value={formatNumber(activity.active_time, 1)}
                unit="sec"
              />

              <Metric
                icon={Clock3}
                label="Idle Time"
                value={formatNumber(activity.idle_time, 1)}
                unit="sec"
              />

              <Metric
                icon={Keyboard}
                label="Keyboard"
                value={activity.keyboard_count ?? 0}
                unit="presses"
              />

              <Metric
                icon={Mouse}
                label="Mouse"
                value={activity.mouse_clicks ?? 0}
                unit="clicks"
              />

              <Metric
                icon={Activity}
                label="Scroll"
                value={activity.scroll_count ?? 0}
                unit="events"
              />

            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center gap-2 mb-2">

                  <AppWindow
                    size={17}
                    className="text-slate-500"
                  />

                  <span className="text-xs font-medium text-slate-500">
                    Current Application
                  </span>

                </div>

                <p className="text-sm font-semibold text-slate-900 break-words">
                  {activity.active_application || "Unknown"}
                </p>

              </div>


              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center gap-2 mb-2">

                  <Activity
                    size={17}
                    className="text-slate-500"
                  />

                  <span className="text-xs font-medium text-slate-500">
                    Application Switches
                  </span>

                </div>

                <p className="text-lg font-semibold text-slate-900">
                  {activity.application_switches ?? 0}
                </p>

              </div>

            </div>


            {/* Applications */}

            <div className="mt-5">

              <div className="flex items-center justify-between mb-3">

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Applications Used
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Applications detected during the session
                  </p>
                </div>

                <span className="text-xs font-medium text-slate-500">
                  {activity.applications_used?.length || 0} apps
                </span>

              </div>


              {activity.applications_used?.length > 0 ? (

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">

                  {activity.applications_used.map(
                    (app, index) => (
                      <span
                        key={`${app}-${index}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700"
                      >
                        {app}
                      </span>
                    )
                  )}

                </div>

              ) : (

                <div className="text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200 p-4">
                  No application information was recorded.
                </div>

              )}

            </div>

          </DetailCard>


          {/* =================================================
            CAMERA + ENVIRONMENT
        ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

            {/* CAMERA */}

            <DetailCard
              icon={Camera}
              title="Camera Monitoring"
              subtitle="Facial and attention-related measurements"
              iconClass="bg-violet-50 text-violet-600"
            >

              <div className="grid grid-cols-2 gap-4">

                <Metric
                  icon={Eye}
                  label="Blink Rate"
                  value={formatNumber(camera.blink_rate, 2)}
                  unit="per min"
                />

                <Metric
                  icon={Eye}
                  label="Eye Closure"
                  value={formatNumber(camera.eye_closure, 2)}
                  unit="%"
                />

                <Metric
                  icon={Smile}
                  label="Yawn Count"
                  value={camera.yawn_count ?? 0}
                />

                <Metric
                  icon={Move3D}
                  label="Head Pose"
                  value={camera.head_pose || "UNKNOWN"}
                />

              </div>

            </DetailCard>


            {/* ENVIRONMENT */}

            <DetailCard
              icon={Sun}
              title="Environment"
              subtitle="Environmental sensor measurements"
              iconClass="bg-amber-50 text-amber-600"
            >

              <div className="grid grid-cols-2 gap-4">

                <Metric
                  icon={Thermometer}
                  label="Temperature"
                  value={
                    environment.temperature !== null &&
                      environment.temperature !== undefined
                      ? formatNumber(
                        environment.temperature,
                        1
                      )
                      : "N/A"
                  }
                  unit={
                    environment.temperature !== null &&
                      environment.temperature !== undefined
                      ? "°C"
                      : ""
                  }
                />

                <Metric
                  icon={Droplets}
                  label="Humidity"
                  value={
                    environment.humidity !== null &&
                      environment.humidity !== undefined
                      ? formatNumber(
                        environment.humidity,
                        1
                      )
                      : "N/A"
                  }
                  unit={
                    environment.humidity !== null &&
                      environment.humidity !== undefined
                      ? "%"
                      : ""
                  }
                />

                <Metric
                  icon={Sun}
                  label="Light"
                  value={
                    environment.light !== null &&
                      environment.light !== undefined
                      ? formatNumber(
                        environment.light,
                        1
                      )
                      : "N/A"
                  }
                  unit={
                    environment.light !== null &&
                      environment.light !== undefined
                      ? "lux"
                      : ""
                  }
                />

                <Metric
                  icon={Ruler}
                  label="Distance"
                  value={
                    environment.distance !== null &&
                      environment.distance !== undefined
                      ? formatNumber(
                        environment.distance,
                        1
                      )
                      : "N/A"
                  }
                  unit={
                    environment.distance !== null &&
                      environment.distance !== undefined
                      ? "cm"
                      : ""
                  }
                />

              </div>


              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Radio
                      size={17}
                      className="text-slate-500"
                    />

                    <span className="text-xs font-medium text-slate-500">
                      Motion
                    </span>

                  </div>

                  <span className="text-sm font-semibold text-slate-900">
                    {environment.motion === null ||
                      environment.motion === undefined
                      ? "Not available"
                      : environment.motion
                        ? "Detected"
                        : "Not detected"}
                  </span>

                </div>

              </div>

            </DetailCard>

          </div>


          {/* =================================================
            SYSTEM
        ================================================= */}

          <DetailCard
            icon={Battery}
            title="System Status"
            subtitle="System and device conditions captured during the session"
            iconClass="bg-sky-50 text-sky-600"
            className="mb-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Metric
                icon={Sun}
                label="Screen Brightness"
                value={formatNumber(system.brightness, 1)}
                unit="%"
              />

              <Metric
                icon={Battery}
                label="Battery"
                value={formatNumber(
                  system.battery_percentage,
                  1
                )}
                unit="%"
              />

              <Metric
                icon={Zap}
                label="Charging"
                value={
                  system.charging_status
                    ? "Connected"
                    : "Not charging"
                }
              />

            </div>

          </DetailCard>

          {/* =================================================
  FATIGUE SELF-REPORT
================================================= */}

          <DetailCard
            icon={FileText}
            title="Fatigue Self-Report"
            subtitle="Fatigue level reported by the user during this session"
            iconClass="bg-blue-50 text-blue-600"
            className="mb-6"
          >

            {fatigueReport?.level ? (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Reported Level */}

                <div
                  className="
          rounded-2xl
          border
          border-blue-100
          bg-gradient-to-br
          from-blue-50/80
          via-white
          to-white
          p-5
        "
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
              "
                      >
                        <FileText
                          size={19}
                          strokeWidth={2.1}
                        />
                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Reported Fatigue Level
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {fatigueReport.level}
                        </p>

                      </div>

                    </div>

                    <StatusBadge
                      type={getRiskType(
                        fatigueReport.level
                      )}
                    >
                      {fatigueReport.level}
                    </StatusBadge>

                  </div>

                </div>


                {/* Reported At */}

                <div
                  className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
        "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-600
            "
                    >
                      <Clock3
                        size={19}
                        strokeWidth={2.1}
                      />
                    </div>

                    <div>

                      <p className="text-xs font-medium text-slate-500">
                        Reported At
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDateTime(
                          fatigueReport.reported_at
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            ) : (

              <div
                className="
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-5
      "
              >

                <div
                  className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-slate-200
          text-slate-500
        "
                >
                  <FileText
                    size={19}
                    strokeWidth={2.1}
                  />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    No fatigue self-report
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    The user did not submit a fatigue self-report
                    during this session.
                  </p>

                </div>

              </div>

            )}

          </DetailCard>
          {/* =================================================
            AI ANALYSIS
        ================================================= */}

          <DetailCard
            icon={BrainCircuit}
            title="AI Analysis"
            subtitle="Fatigue, burnout and health analysis reconstructed from session activity"
            iconClass="bg-violet-50 text-violet-600"
            className="mb-6"
          >
            {ai.available && prediction ? (

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <ScoreCard
                  icon={BrainCircuit}
                  title="Fatigue"
                  score={fatigue.score}
                  level={fatigue.level}
                  tone="violet"
                  description="Fatigue score"
                />

                <ScoreCard
                  icon={AlertTriangle}
                  title="Burnout"
                  score={burnout.score}
                  level={burnout.level}
                  tone="amber"
                  description="Burnout score"
                />

                <ScoreCard
                  icon={HeartPulse}
                  title="Health"
                  score={health.score}
                  level={health.level}
                  tone="emerald"
                  description="Health score"
                />

              </div>

            ) : (

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <AlertTriangle
                    size={19}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      AI analysis unavailable
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      AI analysis could not be generated for this session.
                    </p>
                  </div>

                </div>

              </div>

            )}

          </DetailCard>


          {/* =================================================
            FOOTER
        ================================================= */}

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm pb-3">

            <button
              onClick={closeModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={17} />
              Back to History
            </button>

            <span className="text-xs text-slate-400">
              Session #{session.session_id}
            </span>

          </div>

        </main>

      </div>
    </div>
  );
};

export default SessionDetails;
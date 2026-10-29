import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Activity,
  Thermometer,
  BrainCircuit,
  FileText,
  Lightbulb,
  History,
  Settings,
  User,
  Camera,
} from "lucide-react";

import { getCurrentMonitoring } from "../../api/monitoringApi";

const Sidebar = () => {
  const location = useLocation();

  // ==========================================
  // USER
  // ==========================================

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId = storedUser?.id ?? null;

  // ==========================================
  // CURRENT MODE
  // ==========================================
  //
  // IMPORTANT:
  // Start with the mode saved in localStorage.
  // This allows the sidebar to remember the mode
  // even when monitoring is stopped.
  //

  const [selectedMode, setSelectedMode] = useState(() => {
    return localStorage.getItem("selectedMode") || null;
  });

  // ==========================================
  // MODE LOADING
  // ==========================================

  const [modeLoading, setModeLoading] = useState(true);

  // ==========================================
  // GET CURRENT MODE FROM BACKEND
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const fetchCurrentMode = async () => {
      if (!userId) {
        if (mounted) {
          setModeLoading(false);
        }
        return;
      }

      try {
        if (mounted) {
          setModeLoading(true);
        }

        const { data } = await getCurrentMonitoring(userId);

        console.log(
          "Sidebar current monitoring:",
          data
        );

        // ==========================================
        // ACTIVE SESSION
        // ==========================================

        if (
          data?.success &&
          data?.has_active_session &&
          data?.session
        ) {
          let backendMode = null;

          if (
            data.session.mode === "AI_MONITORING"
          ) {
            backendMode = "ai_monitoring";
          } else if (
            data.session.mode === "DATA_COLLECTION"
          ) {
            backendMode = "data_collection";
          }

          if (backendMode && mounted) {
            setSelectedMode(backendMode);

            // Keep localStorage synchronized
            localStorage.setItem(
              "selectedMode",
              backendMode
            );
          }
        }

        // ==========================================
        // NO ACTIVE SESSION
        // ==========================================
        //
        // IMPORTANT:
        // Do NOT clear selectedMode.
        //
        // The user may simply have stopped monitoring.
        // We still want the sidebar to remember the
        // last selected mode.
        //

        else if (
          data?.success &&
          !data?.has_active_session
        ) {
          const savedMode =
            localStorage.getItem("selectedMode");

          if (savedMode && mounted) {
            setSelectedMode(savedMode);
          }
        }

        if (mounted) {
          setModeLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to get current monitoring mode:",
          error?.response?.data ||
          error?.message ||
          error
        );

        // ==========================================
        // API ERROR
        // ==========================================
        //
        // Do NOT erase the mode.
        // Keep the last known mode from localStorage.
        //

        const savedMode =
          localStorage.getItem("selectedMode");

        if (savedMode && mounted) {
          setSelectedMode(savedMode);
        }

        if (mounted) {
          setModeLoading(false);
        }
      }
    };

    fetchCurrentMode();

    return () => {
      mounted = false;
    };
  }, [userId, location.pathname]);

  // ==========================================
  // COMMON ITEMS
  // ==========================================

  const commonItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Camera Data",
      path: "/camera-data",
      icon: Camera,
    },
    {
      name: "Environment",
      path: "/environment",
      icon: Thermometer,
    },
    {
      name: "Activity",
      path: "/activity",
      icon: Activity,
    },
  ];

  // ==========================================
  // AI MODE ITEMS
  // ==========================================

  const aiMonitoringItems = [
    {
      name: "Fatigue Prediction",
      path: "/fatigue-prediction",
      icon: BrainCircuit,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
    },
    {
      name: "Recommendations",
      path: "/recommendations",
      icon: Lightbulb,
    },
  ];

  // ==========================================
  // BOTTOM ITEMS
  // ==========================================

  const bottomItems = [
    {
      name: "History",
      path: "/history",
      icon: History,
    },


    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  // ==========================================
  // BUILD SIDEBAR
  // ==========================================

  let navItems = [
    ...commonItems,
    ...bottomItems,
  ];

  if (selectedMode === "ai_monitoring") {
    navItems = [
      ...commonItems,
      ...aiMonitoringItems,
      ...bottomItems,
    ];
  }

  // ==========================================
  // MODE NAME
  // ==========================================

  const getModeName = () => {
    if (selectedMode === "ai_monitoring") {
      return "AI Fatigue Detection";
    }

    if (selectedMode === "data_collection") {
      return "Data Collection";
    }

    return "Select Monitoring Mode";
  };

  const modeName = getModeName();

  // ==========================================
  // RETURN UI
  // ==========================================

  return (
    <aside
      className="
      fixed
      left-0
      top-0
      z-50
      flex
      h-screen
      w-[270px]
      flex-col
      border-r
      border-slate-200
      bg-white
      shadow-[4px_0_24px_rgba(15,23,42,0.04)]
    "
    >

      {/* =====================================================
        CURRENT MONITORING MODE
    ===================================================== */}

      <div className="shrink-0 px-4 pt-4">

        <div
          className={`
          relative
          overflow-hidden
          rounded-2xl
          border
          p-3.5
          transition-all
          duration-200

          ${selectedMode === "ai_monitoring"
              ? "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-blue-50"
              : selectedMode === "data_collection"
                ? "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50"
                : "border-slate-200 bg-slate-50"
            }
        `}
        >

          {/* Decorative glow */}
          <div
            className={`
            absolute
            -right-5
            -top-5
            h-16
            w-16
            rounded-full
            blur-2xl

            ${selectedMode === "ai_monitoring"
                ? "bg-violet-200/50"
                : selectedMode === "data_collection"
                  ? "bg-blue-200/50"
                  : "bg-slate-200/50"
              }
          `}
          />

          <div className="relative">

            {/* Label */}
            <div className="flex items-center justify-between">

              <span
                className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
              >
                Monitoring Mode
              </span>

              {selectedMode && (
                <span
                  className={`
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-semibold

                  ${selectedMode === "ai_monitoring"
                      ? "text-violet-600"
                      : "text-blue-600"
                    }
                `}
                >
                  <span
                    className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${selectedMode === "ai_monitoring"
                        ? "bg-violet-500"
                        : "bg-blue-500"
                      }
                  `}
                  />

                  Active
                </span>
              )}

            </div>


            {/* Mode */}
            <div className="mt-2.5 flex items-center gap-2.5">

              <div
                className={`
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl

                ${selectedMode === "ai_monitoring"
                    ? "bg-violet-100 text-violet-600"
                    : selectedMode === "data_collection"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-200 text-slate-500"
                  }
              `}
              >

                {selectedMode === "ai_monitoring" ? (
                  <BrainCircuit
                    size={16}
                    strokeWidth={2.1}
                  />
                ) : (
                  <Activity
                    size={16}
                    strokeWidth={2.1}
                  />
                )}

              </div>

              <div className="min-w-0">

                <p
                  className="
                  truncate
                  text-xs
                  font-bold
                  text-slate-800
                "
                >
                  {modeName}
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">

                  {modeLoading && (
                    <span
                      className="
                      h-1.5
                      w-1.5
                      animate-pulse
                      rounded-full
                      bg-slate-400
                    "
                    />
                  )}

                  <span className="text-[10px] text-slate-400">
                    {modeLoading
                      ? "Checking status..."
                      : selectedMode
                        ? "Monitoring configuration"
                        : "Choose a monitoring mode"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
        NAVIGATION
    ===================================================== */}

      <nav
        className="
        flex-1
        overflow-y-auto
        px-3
        py-5

        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-slate-200
      "
      >

        {/* MAIN */}
        <div>

          <p
            className="
            mb-2
            px-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-400
          "
          >
            Workspace
          </p>


          <div className="space-y-1">

            {commonItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-[13px]
                    font-semibold
                    transition-all
                    duration-200

                    ${isActive
                      ? `
                          bg-blue-50
                          text-blue-700
                        `
                      : `
                          text-slate-600
                          hover:bg-slate-50
                          hover:text-slate-900
                        `
                    }
                  `
                  }
                >

                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          className="
                          absolute
                          left-0
                          top-1/2
                          h-6
                          w-1
                          -translate-y-1/2
                          rounded-r-full
                          bg-blue-600
                        "
                        />
                      )}

                      <span
                        className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        transition-all

                        ${isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "bg-transparent text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                          }
                      `}
                      >
                        <Icon
                          size={22}
                          strokeWidth={2.2}
                        />
                      </span>

                      <span className="truncate">
                        {item.name}
                      </span>

                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </>
                  )}

                </NavLink>
              );

            })}

          </div>

        </div>


        {/* AI SECTION */}
        {selectedMode === "ai_monitoring" && (
          <div className="mt-6">

            <div className="mb-2 flex items-center gap-2 px-3">

              <p
                className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
              >
                AI Insights
              </p>

              <span className="h-1 w-1 rounded-full bg-violet-400" />

            </div>


            <div className="space-y-1">

              {aiMonitoringItems.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `
                      group
                      relative
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-[13px]
                      font-semibold
                      transition-all
                      duration-200

                      ${isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `
                    }
                  >

                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="
                            absolute
                            left-0
                            top-1/2
                            h-6
                            w-1
                            -translate-y-1/2
                            rounded-r-full
                            bg-violet-500
                          "
                          />
                        )}

                        <span
                          className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg

                          ${isActive
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                              : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                            }
                        `}
                        >
                          <Icon
                          size={22}
                          strokeWidth={2.2}
                          />
                        </span>

                        <span className="truncate">
                          {item.name}
                        </span>

                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500" />
                        )}
                      </>
                    )}

                  </NavLink>
                );

              })}

            </div>

          </div>
        )}


        {/* SYSTEM */}
        <div className="mt-6">

          <p
            className="
            mb-2
            px-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-400
          "
          >
            System
          </p>


          <div className="space-y-1">

            {bottomItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-[13px]
                    font-semibold
                    transition-all
                    duration-200

                    ${isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `
                  }
                >

                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="
                          absolute
                          left-0
                          top-1/2
                          h-6
                          w-1
                          -translate-y-1/2
                          rounded-r-full
                          bg-blue-600
                        "
                        />
                      )}

                      <span
                        className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg

                        ${isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
                          }
                      `}
                      >
                        <Icon
                          size={22}
                          strokeWidth={2.2}
                        />
                      </span>

                      <span className="truncate">
                        {item.name}
                      </span>

                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </>
                  )}

                </NavLink>
              );

            })}

          </div>

        </div>

      </nav>


      {/* =====================================================
        FOOTER
    ===================================================== */}

      <div className="shrink-0 border-t border-slate-100 p-3">

        <div
          className="
          flex
          items-center
          gap-3
          rounded-xl
          bg-slate-50
          px-3
          py-2.5
          border
          border-slate-100
        "
        >

          <div
            className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-white
            border
            border-slate-200
          "
          >
            <Activity
              size={15}
              className="text-blue-600"
              strokeWidth={2.1}
            />
          </div>

          <div className="min-w-0">

            <p className="text-[11px] font-bold text-slate-700">
              VitaSense Platform
            </p>

            <p className="text-[10px] text-slate-400">
              Desktop Application · v1.0
            </p>

          </div>

          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;
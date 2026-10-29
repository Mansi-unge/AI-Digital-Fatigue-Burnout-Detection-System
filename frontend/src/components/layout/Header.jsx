import React, { useEffect, useState } from "react";
import {
  Bell,
  BrainCircuit,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../common/ProfileMenu";
import { getUnreadNotifications } from "../../api/notificationApi";
import { getCurrentMonitoring } from "../../api/monitoringApi";

const Header = () => {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [currentTime, setCurrentTime] = useState(new Date());

  // Use localStorage only as an initial fallback.
  // Backend will be the actual source of truth.
  const [selectedMode, setSelectedMode] = useState(() => {
    const storedMode = localStorage.getItem("selectedMode");

    if (!storedMode) {
      return null;
    }

    return String(storedMode)
      .trim()
      .toUpperCase()
      .replace(/[- ]/g, "_");
  });

  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // ==========================================================
  // NORMALIZE MONITORING MODE
  // ==========================================================

  const normalizeMode = (mode) => {
    if (!mode) {
      return null;
    }

    const normalized = String(mode)
      .trim()
      .toUpperCase()
      .replace(/[- ]/g, "_");

    if (normalized === "AI_MONITORING") {
      return "AI_MONITORING";
    }

    if (normalized === "DATA_COLLECTION") {
      return "DATA_COLLECTION";
    }

    return null;
  };

  // ==========================================================
  // AI MONITORING CHECK
  // ==========================================================

  const isAIMonitoring =
    selectedMode === "AI_MONITORING";

  // ==========================================================
  // LOAD CURRENT MONITORING MODE
  //
  // BACKEND = SOURCE OF TRUTH
  // ==========================================================

  // useEffect(() => {
  //   let mounted = true;

  //   const loadCurrentMode = async () => {
  //     try {
  //       const response = await getCurrentMonitoring(userId);

  //       if (!mounted) {
  //         return;
  //       }

  //       // Support different possible backend response structures.
  //       const rawMode =
  //         response.data?.mode ??
  //         response.data?.current_mode ??
  //         response.data?.monitoring_mode ??
  //         response.data?.data?.mode ??
  //         response.data?.data?.current_mode ??
  //         response.data?.data?.monitoring_mode ??
  //         null;

  //       const mode = normalizeMode(rawMode);

  //       console.log("================================");
  //       console.log("Header Monitoring Mode");
  //       console.log("Raw mode:", rawMode);
  //       console.log("Normalized mode:", mode);
  //       console.log("AI Monitoring:", mode === "AI_MONITORING");
  //       console.log("================================");

  //       // Only update state when backend actually
  //       // provides a recognized mode.
  //       //
  //       // This is important:
  //       // A temporary malformed/empty response must NOT
  //       // suddenly hide the notification bell.
  //       if (mode) {
  //         setSelectedMode(mode);

  //         // Keep localStorage synchronized.
  //         localStorage.setItem("selectedMode", mode);
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Failed to load current monitoring mode:",
  //         error.response?.data || error.message
  //       );

  //       // IMPORTANT:
  //       // Do NOT set selectedMode to null here.
  //       //
  //       // If the backend request temporarily fails,
  //       // the existing AI Monitoring state remains active.
  //     }
  //   };

  //   // Load immediately.
  //   loadCurrentMode();

  //   // Re-check active monitoring mode every 5 seconds.
  //   const timer = setInterval(() => {
  //     loadCurrentMode();
  //   }, 5000);

  //   return () => {
  //     mounted = false;
  //     clearInterval(timer);
  //   };
  // }, []);

  useEffect(() => {
  let mounted = true;

  const loadCurrentMode = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      let parsedUser;

      try {
        parsedUser = JSON.parse(storedUser);
      } catch (parseError) {
        console.error("Invalid user data in localStorage");
        return;
      }

      const userId = parsedUser?.id;

      if (!userId) {
        console.warn("No user ID found in localStorage");
        return;
      }

      const response = await getCurrentMonitoring(userId);

      if (!mounted) {
        return;
      }

      // Support different possible backend response structures.
      const rawMode =
        response.data?.mode ??
        response.data?.current_mode ??
        response.data?.monitoring_mode ??
        response.data?.data?.mode ??
        response.data?.data?.current_mode ??
        response.data?.data?.monitoring_mode ??
        null;

      const mode = normalizeMode(rawMode);

      console.log("================================");
      console.log("Header Monitoring Mode");
      console.log("User ID:", userId);
      console.log("Raw mode:", rawMode);
      console.log("Normalized mode:", mode);
      console.log("AI Monitoring:", mode === "AI_MONITORING");
      console.log("================================");

      // Only update state when backend actually
      // provides a recognized mode.
      if (mode) {
        setSelectedMode(mode);
        localStorage.setItem("selectedMode", mode);
      }
    } catch (error) {
      console.error(
        "Failed to load current monitoring mode:",
        error.response?.data || error.message
      );

      // Do NOT clear selectedMode here.
      // A temporary backend error should not hide
      // the notification bell.
    }
  };

  // Load immediately.
  loadCurrentMode();

  // Re-check active monitoring mode every 5 seconds.
  const timer = setInterval(() => {
    loadCurrentMode();
  }, 5000);

  return () => {
    mounted = false;
    clearInterval(timer);
  };
}, []);

  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        id: parsedUser?.id ?? null,
        name: parsedUser?.name ?? "",
        email: parsedUser?.email ?? "",
      });
    } catch (error) {
      console.error(
        "Invalid user data in localStorage"
      );
    }
  }, []);

  // ==========================================================
  // CLOCK
  // ==========================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ==========================================================
  // LOAD UNREAD NOTIFICATIONS
  //
  // ONLY FOR AI MONITORING
  // ==========================================================

  const loadUnreadNotifications = async () => {
    // No user or not AI Monitoring.
    if (!user.id || !isAIMonitoring) {
      return;
    }

    try {
      const response =
        await getUnreadNotifications(user.id);

      if (response.data?.success) {
        setUnreadCount(
          response.data.unread_count ?? 0
        );
      }
    } catch (error) {
      console.error(
        "Failed to load unread notifications:",
        error.response?.data || error.message
      );

      // IMPORTANT:
      // Do not clear unreadCount on a temporary
      // notification API failure.
    }
  };

  // ==========================================================
  // INITIAL NOTIFICATION LOAD
  //
  // ONLY FOR AI MONITORING
  // ==========================================================

  useEffect(() => {
    if (!user.id || !isAIMonitoring) {
      // Clear badge when actually leaving AI Monitoring.
      if (!isAIMonitoring) {
        setUnreadCount(0);
      }

      return;
    }

    loadUnreadNotifications();
  }, [user.id, isAIMonitoring]);

  // ==========================================================
  // REFRESH UNREAD COUNT
  //
  // EVERY 10 SECONDS
  // ONLY FOR AI MONITORING
  // ==========================================================

  useEffect(() => {
    if (!user.id || !isAIMonitoring) {
      return;
    }

    const notificationTimer = setInterval(() => {
      loadUnreadNotifications();
    }, 10000);

    return () => {
      clearInterval(notificationTimer);
    };
  }, [user.id, isAIMonitoring]);

  // ==========================================================
  // BELL CLICK
  // ==========================================================

  const handleNotificationClick = () => {
    if (!isAIMonitoring) {
      return;
    }

    navigate("/notifications");
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedMode");

    setUnreadCount(0);
    setSelectedMode(null);

    navigate("/login");
  };

  // ==========================================================
  // DISPLAY VALUES
  // ==========================================================

  const displayName =
    user?.name || "User";

  const displayEmail =
    user?.email || "No email available";

  const accountId = user?.id
    ? `USR-${String(user.id).padStart(4, "0")}`
    : "USR-0000";

  // ==========================================================
  // UI
  // ==========================================================

  return (
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

      {/* ======================================================
          LEFT SECTION
      ====================================================== */}

      <div className="shrink-0">

        <h1 className="text-2xl font-bold text-gray-900">
          VITASENSE
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {displayName}
        </p>

      </div>

      {/* ======================================================
          RIGHT SECTION
      ====================================================== */}

      <div className="flex items-center gap-3">

        {/* ====================================================
            MONITORING STATUS
        ==================================================== */}

        <div
          className="
            hidden xl:flex
            items-center
            gap-2
            px-3.5
            py-2
            rounded-xl
            bg-green-50
            border
            border-green-200
          "
        >

          <span className="relative flex h-2.5 w-2.5">

            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                rounded-full
                bg-green-500
                opacity-75
                animate-ping
              "
            />

            <span
              className="
                relative
                inline-flex
                rounded-full
                h-2.5
                w-2.5
                bg-green-500
              "
            />

          </span>

          <BrainCircuit
            size={17}
            className="text-green-600"
          />

          <span className="text-emerald-600 text-sm font-medium">
            Monitoring Active
          </span>

        </div>

        {/* ====================================================
            CURRENT TIME
        ==================================================== */}

        <div
          className="
            hidden md:flex
            items-center
            gap-2
            text-gray-600
            px-1
          "
        >

          <Clock3
            size={17}
            className="text-blue-500"
          />

          <span className="text-sm whitespace-nowrap">
            {currentTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>

        </div>

        {/* ====================================================
            NOTIFICATION BELL
            ONLY VISIBLE DURING AI MONITORING
        ==================================================== */}

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

            {/* ==================================================
                UNREAD BADGE
            ================================================== */}

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
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

          </button>
        )}

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <ProfileMenu
          user={{
            ...user,
            accountId,
          }}
        />

      </div>

    </header>
  );
};

export default Header;
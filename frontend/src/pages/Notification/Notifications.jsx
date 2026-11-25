import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Lightbulb,
  AlertTriangle,
  HeartPulse,
  BrainCircuit,
  Monitor,
  Info,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Inbox,
} from "lucide-react";

import {
  getNotifications,
  markAllNotificationsSeen,
  markNotificationSeen,
} from "../../api/notificationApi";


const Notifications = () => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [userId, setUserId] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [markingId, setMarkingId] = useState(null);

  const [markingAll, setMarkingAll] = useState(false);


  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {

      setLoading(false);

      return;
    }

    try {

      const parsedUser = JSON.parse(storedUser);

      setUserId(parsedUser?.id ?? null);

    } catch (error) {

      console.error(
        "Invalid user data in localStorage:",
        error
      );

      setError(
        "Unable to load user information."
      );

      setLoading(false);
    }

  }, []);


  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications = useCallback(
    async (showLoader = true, showError = true) => {
      if (!userId) return;

      try {
        if (showLoader) {
          setLoading(true);
        }

        setRefreshing(true);

        if (showError) {
          setError("");
        }

        const response = await getNotifications(userId);

        if (response.data?.success) {
          setNotifications(
            response.data.notifications ?? []
          );
        } else if (showError) {
          setError(
            response.data?.message ||
            "Unable to load notifications."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error.response?.data || error.message
        );

        if (showError) {
          setError(
            error.response?.data?.message ||
            "Failed to load notifications."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  // ==========================================================
  // LOAD WHEN USER IS AVAILABLE
  // ==========================================================
  useEffect(() => {
    if (!userId) return;

    // Initial notification loading
    loadNotifications();

    // Automatically refresh every 60 seconds
    const interval = setInterval(() => {
      loadNotifications(false, false);
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [userId, loadNotifications]);
  // ==========================================================
  // MARK ONE AS SEEN
  // ==========================================================


  const handleMarkSeen = async (notificationId) => {
    if (!userId) return;

    try {
      setMarkingId(notificationId);

      const response = await markNotificationSeen(
        notificationId,
        userId
      );

      if (response.data?.success) {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? {
                ...notification,
                is_seen: true,
                seen_at: response.data.seen_at,
              }
              : notification
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as seen:",
        error.response?.data || error.message
      );
    } finally {
      setMarkingId(null);
    }
  };



  // ==========================================================
  // MARK ALL AS SEEN
  // ==========================================================

  const handleMarkAllSeen = async () => {
    if (!userId) return;

    try {
      setMarkingAll(true);

      const response = await markAllNotificationsSeen(userId);

      if (response.data?.success) {
        const seenAt = new Date().toISOString();

        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            is_seen: true,
            seen_at: notification.is_seen
              ? notification.seen_at
              : seenAt,
          }))
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark all notifications as seen:",
        error.response?.data || error.message
      );
    } finally {
      setMarkingAll(false);
    }
  };


  // ==========================================================
  // COUNTS
  // ==========================================================

  const unreadCount = useMemo(() => {

    return notifications.filter(
      (notification) =>
        !notification.is_seen
    ).length;

  }, [notifications]);


  const seenCount = useMemo(() => {

    return notifications.filter(
      (notification) =>
        notification.is_seen
    ).length;

  }, [notifications]);


  // ==========================================================
  // DATE / TIME
  // ==========================================================

  const formatDate = (dateString) => {

    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };


  const formatRelativeTime = (dateString) => {

    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      Math.floor(
        (now.getTime() - date.getTime()) /
        1000
      );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {

      const minutes =
        Math.floor(difference / 60);

      return `${minutes} min ago`;
    }

    if (difference < 86400) {

      const hours =
        Math.floor(difference / 3600);

      return `${hours} hr ago`;
    }

    const days =
      Math.floor(difference / 86400);

    return `${days} day${days > 1 ? "s" : ""} ago`;
  };


  // ==========================================================
  // PRIORITY
  // ==========================================================

  const getPriorityConfig = (priority) => {

    switch (priority?.toLowerCase()) {

      case "high":

        return {
          label: "High",

          badge:
            "bg-red-50 text-red-700 border-red-200",

          dot:
            "bg-red-500",

          icon:
            "bg-red-50 text-red-600",

          accent:
            "border-l-red-500",
        };


      case "medium":

        return {
          label: "Medium",

          badge:
            "bg-amber-50 text-amber-700 border-amber-200",

          dot:
            "bg-amber-500",

          icon:
            "bg-amber-50 text-amber-600",

          accent:
            "border-l-amber-500",
        };


      default:

        return {
          label: "Low",

          badge:
            "bg-blue-50 text-blue-700 border-blue-200",

          dot:
            "bg-blue-500",

          icon:
            "bg-blue-50 text-blue-600",

          accent:
            "border-l-blue-500",
        };
    }
  };


  // ==========================================================
  // NOTIFICATION ICON
  // ==========================================================

  const getNotificationIcon = (type) => {

    switch (type?.toLowerCase()) {

      case "fatigue":
        return BrainCircuit;

      case "burnout":
        return AlertTriangle;

      case "health":
        return HeartPulse;

      case "screen time":
        return Monitor;

      case "break":
        return Clock3;

      case "idle time":
        return Clock3;

      default:
        return Lightbulb;
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#f5f7fb] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[650px] max-w-[1600px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading Notifications Workspace
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Loading your latest alerts and recommendations...
            </p>

          </div>
        </div>
      </div>
    );
  }
  
  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div className="
        min-h-full
        w-full
        bg-slate-50
      ">

        <div className="
          mx-auto
          w-full
          max-w-[1800px]
          px-5
          py-6
          sm:px-7
          lg:px-8
        ">

          <div className="
            rounded-2xl
            border
            border-red-200
            bg-white
            p-6
            shadow-sm
          ">

            <div className="
              flex
              items-start
              gap-4
            ">

              <div className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              ">

                <ShieldAlert size={22} />

              </div>

              <div className="min-w-0">

                <h2 className="
                  font-semibold
                  text-slate-900
                ">
                  Unable to load notifications
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-slate-500
                ">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadNotifications()
                  }
                  className="
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >

                  <RefreshCw size={16} />

                  Try Again

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="
      min-h-full
      w-full
      bg-slate-50
    ">

      <div className="
        mx-auto
        w-full
        max-w-[1800px]
        px-4
        py-5
        sm:px-6
        sm:py-6
        lg:px-8
        xl:px-10
      ">


        {/* ======================================================
            NOTIFICATION HEADER
        ====================================================== */}

        <div className="
          sticky
          top-0
          z-20
          -mx-4
          mb-5
          border-b
          border-slate-200
          bg-slate-50/95
          px-4
          pb-4
          backdrop-blur
          sm:-mx-6
          sm:px-6
          lg:-mx-8
          lg:px-8
          xl:-mx-10
          xl:px-10
        ">

          <div className="
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-center
          ">


            {/* ==================================================
                LEFT — TITLE
            ================================================== */}

            <div className="
              flex
              min-w-0
              flex-1
              items-center
              gap-3
            ">

              <div className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-white
                shadow-sm
              ">

                <Bell size={21} />

              </div>


              <div className="min-w-0">

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <h1 className="
                    truncate
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  ">
                    Notifications
                  </h1>


                  {unreadCount > 0 && (

                    <span className="
                      inline-flex
                      min-w-6
                      items-center
                      justify-center
                      rounded-full
                      bg-red-500
                      px-2
                      py-0.5
                      text-xs
                      font-bold
                      text-white
                    ">
                      {unreadCount}
                    </span>

                  )}

                </div>


                <p className="
                  mt-0.5
                  truncate
                  text-sm
                  text-slate-500
                ">
                  Your latest VitaSense alerts and recommendations
                </p>

              </div>

            </div>


            {/* ==================================================
                CENTER — COMPACT STATISTICS
            ================================================== */}

            <div className="
              flex
              w-full
              items-center
              justify-start
              overflow-x-auto
              rounded-md
              bg-white
              shadow-xs
              xl:w-auto
              xl:justify-center
            ">


              {/* ==================================================
                  RECENT
              ================================================== */}

              <div className="
                flex
                min-w-[100px]
                items-center
                gap-2
                border-r
                border-slate-200
                px-4
                py-2.5
              ">

                <div className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-slate-500
                ">

                  <Inbox size={16} />

                </div>


                <div>

                  <p className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Recent
                  </p>

                  <p className="
                    text-base
                    font-bold
                    leading-5
                    text-slate-900
                  ">
                    {notifications.length}
                  </p>

                </div>

              </div>


              {/* ==================================================
                  UNREAD
              ================================================== */}

              <div className="
                flex
                min-w-[100px]
                items-center
                gap-2
                border-r
                border-slate-200
                px-4
                py-2.5
              ">

                <div className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-500
                ">

                  <Bell size={16} />

                </div>


                <div>

                  <p className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Unread
                  </p>

                  <p className={`
                    text-base
                    font-bold
                    leading-5
                    ${unreadCount > 0
                      ? "text-red-500"
                      : "text-slate-900"
                    }
                  `}>
                    {unreadCount}
                  </p>

                </div>

              </div>


              {/* ==================================================
                  SEEN
              ================================================== */}

              <div className="
                flex
                min-w-[100px]
                items-center
                gap-2
                px-4
                py-2.5
              ">

                <div className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-50
                  text-emerald-600
                ">

                  <Check size={16} />

                </div>


                <div>

                  <p className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Seen
                  </p>

                  <p className="
                    text-base
                    font-bold
                    leading-5
                    text-emerald-600
                  ">
                    {seenCount}
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                RIGHT — ACTIONS
            ================================================== */}

            <div className="
              flex
              shrink-0
              items-center
              gap-2
            ">


              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  loadNotifications(false)
                }
                disabled={refreshing}
                title="Refresh notifications"
                className="
                  inline-flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
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


              {/* MARK ALL */}

              {unreadCount > 0 && (

                <button
                  type="button"
                  onClick={handleMarkAllSeen}
                  disabled={markingAll}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-900
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {markingAll ? (

                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                  ) : (

                    <CheckCheck size={16} />

                  )}

                  <span className="hidden sm:inline">
                    Mark all as seen
                  </span>

                </button>

              )}

            </div>

          </div>

        </div>


        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {notifications.length === 0 && (

          <div className="
            flex
            min-h-[420px]
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            py-16
          ">

            <div className="
              max-w-md
              text-center
            ">

              <div className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
              ">

                <Inbox size={29} />

              </div>


              <h2 className="
                mt-5
                text-xl
                font-bold
                text-slate-900
              ">
                You're all caught up
              </h2>


              <p className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              ">
                New VitaSense recommendations and
                alerts will appear here when they
                are generated.
              </p>

            </div>

          </div>

        )}


        {/* ======================================================
            NOTIFICATION LIST
        ====================================================== */}

        {notifications.length > 0 && (

          <div className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          ">

            {notifications.map(
              (notification) => {

                const Icon =
                  getNotificationIcon(
                    notification.type
                  );

                const priority =
                  getPriorityConfig(
                    notification.priority
                  );


                return (

                  <div
                    key={notification.id}
                    className={`
                      group
                      relative
                      border-l-4
                      ${priority.accent}
                      border-b
                      border-slate-100
                      px-4
                      py-4
                      transition
                      last:border-b-0
                      sm:px-5
                      sm:py-5
                      ${notification.is_seen
                        ? "bg-white hover:bg-slate-50/70"
                        : "bg-blue-50/30 hover:bg-blue-50/60"
                      }
                    `}
                  >

                    <div className="
                      flex
                      items-start
                      gap-3
                      sm:gap-4
                    ">


                      {/* ==================================================
                          ICON
                      ================================================== */}

                      <div className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${priority.icon}
                        sm:h-11
                        sm:w-11
                      `}>

                        <Icon size={20} />

                      </div>


                      {/* ==================================================
                          MAIN CONTENT
                      ================================================== */}

                      <div className="
                        min-w-0
                        flex-1
                      ">


                        {/* ==================================================
                            TOP ROW
                        ================================================== */}

                        <div className="
                          flex
                          flex-col
                          gap-2
                          sm:flex-row
                          sm:items-start
                          sm:justify-between
                        ">

                          <div className="min-w-0">

                            <div className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            ">


                              {/* UNREAD DOT */}

                              {!notification.is_seen && (

                                <span className={`
                                  h-2
                                  w-2
                                  shrink-0
                                  rounded-full
                                  ${priority.dot}
                                `} />

                              )}


                              {/* TITLE */}

                              <h3 className="
                                text-sm
                                font-semibold
                                text-slate-900
                                sm:text-base
                              ">
                                {notification.title}
                              </h3>


                              {/* NEW */}

                              {!notification.is_seen && (

                                <span className="
                                  rounded-full
                                  bg-blue-600
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-bold
                                  uppercase
                                  tracking-wide
                                  text-white
                                ">
                                  New
                                </span>

                              )}

                            </div>


                            {/* MESSAGE */}

                            <p className="
                              mt-1.5
                              max-w-4xl
                              text-sm
                              leading-6
                              text-slate-600
                            ">
                              {notification.message}
                            </p>

                          </div>


                          {/* PRIORITY */}

                          <span className={`
                            inline-flex
                            w-fit
                            shrink-0
                            items-center
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            ${priority.badge}
                          `}>

                            {priority.label}

                          </span>

                        </div>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="
                          mt-3
                          flex
                          flex-col
                          gap-3
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        ">


                          {/* META */}

                          <div className="
                            flex
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-2
                            text-xs
                            text-slate-400
                          ">


                            {/* TIME */}

                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                              "
                              title={formatDate(
                                notification.created_at
                              )}
                            >

                              <Clock3 size={13} />

                              {formatRelativeTime(
                                notification.created_at
                              )}

                            </span>


                            {/* TYPE */}

                            {notification.type && (

                              <span className="
                                inline-flex
                                items-center
                                gap-1.5
                              ">

                                <Info size={13} />

                                {notification.type}

                              </span>

                            )}


                            {/* SEEN */}

                            {notification.is_seen && (

                              <span className="
                                inline-flex
                                items-center
                                gap-1.5
                                font-medium
                                text-emerald-600
                              ">

                                <Check size={13} />

                                Seen

                              </span>

                            )}

                          </div>


                          {/* ==================================================
                              MARK AS SEEN
                          ================================================== */}

                          {!notification.is_seen && (

                            <button
                              type="button"
                              onClick={() =>
                                handleMarkSeen(
                                  notification.id
                                )
                              }
                              disabled={
                                markingId ===
                                notification.id
                              }
                              className="
                                inline-flex
                                h-9
                                w-fit
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-blue-200
                                bg-white
                                px-3.5
                                text-xs
                                font-semibold
                                text-blue-600
                                shadow-sm
                                transition
                                hover:border-blue-300
                                hover:bg-blue-50
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                              "
                            >

                              {markingId ===
                                notification.id ? (

                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />

                              ) : (

                                <Check size={14} />

                              )}

                              Mark as seen

                            </button>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}


        {/* ======================================================
            FOOTNOTE
        ====================================================== */}

        <div className="
  mt-4
  flex
  items-center
  justify-center
  gap-2
  text-xs
  text-slate-400
">
          <Clock3 size={13} />

          Seen notifications are removed after 1 hour.
          Unread notifications remain until marked as seen.
        </div>

      </div>

    </div>
  );
};


export default Notifications;
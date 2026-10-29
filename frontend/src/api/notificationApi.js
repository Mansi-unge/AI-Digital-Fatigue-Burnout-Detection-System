import api from "./axios";

// ==========================================================
// GET ALL NOTIFICATIONS
// ==========================================================

export const getNotifications = async (userId) => {
  return api.get("/notifications", {
    params: {
      user_id: userId,
    },
  });
};


// ==========================================================
// GET UNREAD NOTIFICATIONS
// ==========================================================

export const getUnreadNotifications = async (userId) => {
  return api.get("/notifications/unread", {
    params: {
      user_id: userId,
    },
  });
};


// ==========================================================
// MARK ONE NOTIFICATION AS SEEN
// ==========================================================

export const markNotificationSeen = async (
  notificationId,
  userId
) => {
  return api.patch(
    `/notifications/${notificationId}/seen`,
    null,
    {
      params: {
        user_id: userId,
      },
    }
  );
};


// ==========================================================
// MARK ALL NOTIFICATIONS AS SEEN
// ==========================================================

export const markAllNotificationsSeen = async (userId) => {
  return api.patch(
    "/notifications/seen-all",
    null,
    {
      params: {
        user_id: userId,
      },
    }
  );
};
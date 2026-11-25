import api from "./axios";

export const startMonitoring = (userId, mode = "DATA_COLLECTION") =>
  api.post("/monitoring/start", { user_id: userId, mode });

export const stopMonitoring = () => api.post("/monitoring/stop");

export const getMonitoringStatus = (userId) =>
  api.get("/monitoring/status", {
    params: {
      user_id: userId,
    },
  });

export const getCurrentMonitoring = (userId) =>
  api.get("/monitoring/current", {
    params: {
      user_id: userId,
    },
  });

export const getMonitoringData = (userId, sessionId) =>
  api.get("/monitoring/data", {
    params: { user_id: userId, ...(sessionId && { session_id: sessionId }) },
  });

export const getDataCollectionProgress = (userId) =>
  api.get("/monitoring/data-collection/progress", {
    params: {
      user_id: userId,
    },
  });
export const sendIotData = (payload) =>
  api.post("/monitoring/iot-data", payload);

export const saveFatigueReport = (userId, level) =>
  api.post("/monitoring/fatigue", { user_id: userId, level });

export const getLatestFatigue = (userId) =>
  api.get("/monitoring/fatigue/latest", { params: { user_id: userId } });

export const cameraStreamUrl = () =>
  `${api.defaults.baseURL.replace(/\/+$/, "")}/monitoring/camera/stream`;

export const toggleCamera = (userId, enabled) =>
  api.post("/monitoring/camera/toggle", {
    user_id: userId,
    enabled,
  });

export const getCurrentPrediction = (userId) =>
  api.get("/prediction/current", {
    params: {
      user_id: userId,
    },
  });

export const getCurrentRecommendations = (userId) =>
  api.get("/recommendations/current", {
    params: {
      user_id: userId,
    },
  });

// Get historical fatigue, burnout and health predictions
export const getPredictionHistory = (userId) =>
  api.get("/prediction/history", {
    params: {
      user_id: userId,
    },
  });
  
export const getMonitoringHistory = ({
  userId,
  mode,
  groupBy = "session",
  startDate,
  endDate,
}) =>
  api.get("/monitoring/history", {
    params: {
      user_id: userId,
      ...(mode && { mode }),
      group_by: groupBy,
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    },
  });


// Get complete details of one historical monitoring session
export const getMonitoringSessionDetails = (userId, sessionId) =>
  api.get(`/monitoring/history/${sessionId}`, {
    params: {
      user_id: userId,
    },
  });


// Get real-time monitoring start/stop transition progress
export const getMonitoringTransitionStatus = () =>
  api.get("/monitoring/transition-status");

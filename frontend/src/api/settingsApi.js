import api from "./axios";

// ==========================================================
// GET SETTINGS
// ==========================================================

export const getSettings = async (userId) => {
  const response = await api.get(
    `/settings/${userId}`
  );

  return response.data;
};


// ==========================================================
// UPDATE SETTINGS
// ==========================================================

export const updateSettings = async (
  userId,
  settings
) => {
  const response = await api.put(
    `/settings/${userId}`,
    settings
  );

  return response.data;
};
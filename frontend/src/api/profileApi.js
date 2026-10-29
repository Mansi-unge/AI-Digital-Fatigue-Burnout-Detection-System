import api from "./axios";

export const getProfile = async (userId) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  const response = await api.put(`/profile/${userId}`, profileData);
  return response.data;
};

import api from "./axios";

export const getCurrentRecommendations = (userId) =>
  api.get("/recommendations/current", {
    params: {
      user_id: userId,
    },
  });

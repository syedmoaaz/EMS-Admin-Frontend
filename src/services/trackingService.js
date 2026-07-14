import api from "./api";

export const getLiveTracking = async () => {
  const { data } = await api.get("/tracking/live");
  return data;
};

export const getTrackingStats = async () => {
  const { data } = await api.get("/tracking/stats");
  return data;
};

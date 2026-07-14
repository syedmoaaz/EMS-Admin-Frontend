import api from "./api";

export const getAlerts = async (params = {}) => {
  const { data } = await api.get("/alerts", { params });
  return data;
};

export const getUnreadCount = async (params = {}) => {
  const { data } = await api.get("/alerts/unread-count", { params });
  return data;
};

export const syncAlerts = async () => {
  const { data } = await api.post("/alerts/sync");
  return data;
};

export const markAlertRead = async (id) => {
  const { data } = await api.patch(`/alerts/${id}/read`);
  return data;
};

export const markAllRead = async () => {
  const { data } = await api.patch("/alerts/read-all");
  return data;
};

export const dismissAlert = async (id) => {
  const { data } = await api.patch(`/alerts/${id}/dismiss`);
  return data;
};

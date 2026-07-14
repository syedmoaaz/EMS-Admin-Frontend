import api from "./api";

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const updateSettings = async (payload) => {
  const { data } = await api.put("/settings", payload);
  return data;
};

export const getCompanyProfile = async () => {
  const { data } = await api.get("/company/profile");
  return data;
};

export const updateCompanyProfile = async (payload) => {
  const { data } = await api.put("/company/update", payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.put("/company/change-password", payload);
  return data;
};

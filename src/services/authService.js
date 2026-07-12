import api from "./api";

export const login = async (email, password) => {
  const { data } = await api.post("/company/login", { email, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/company/profile");
  return data;
};

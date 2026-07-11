import api from "./api";

export const login = async (userId, password) => {
  const { data } = await api.post("/auth/login", { userId, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

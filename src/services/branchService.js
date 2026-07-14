import api from "./api";

export const getBranches = async (params = {}) => {
  const { data } = await api.get("/branches", { params });
  return data;
};

export const getBranch = async (id) => {
  const { data } = await api.get(`/branches/${id}`);
  return data;
};

export const createBranch = async (payload) => {
  const { data } = await api.post("/branches", payload);
  return data;
};

export const updateBranch = async (id, payload) => {
  const { data } = await api.put(`/branches/${id}`, payload);
  return data;
};

export const deleteBranch = async (id) => {
  const { data } = await api.delete(`/branches/${id}`);
  return data;
};

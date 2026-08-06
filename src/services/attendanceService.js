import api from "./api";

export const getAttendance = async (params = {}) => {
  const { data } = await api.get("/attendance", { params });
  return data;
};

export const getAttendanceStats = async (params = {}) => {
  const { data } = await api.get("/attendance/stats", { params });
  return data;
};

export const getAttendanceHistory = async (employeeId) => {
  const { data } = await api.get(`/attendance/history/${employeeId}`);
  return data;
};

export const createAttendance = async (payload) => {
  const { data } = await api.post("/attendance", payload);
  return data;
};

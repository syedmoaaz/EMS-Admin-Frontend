import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

const TOKEN_KEY = "ems_field_token";
const PROFILE_KEY = "ems_field_profile";

export async function saveSession(token, profile) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {}));
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await AsyncStorage.removeItem(PROFILE_KEY);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function login(employeeId, password) {
  const res = await apiRequest("/field/login", {
    method: "POST",
    body: { employeeId: String(employeeId).trim().toUpperCase(), password },
  });
  await saveSession(res.token, res.data);
  return res;
}

export async function fetchMe(token) {
  const res = await apiRequest("/field/me", { token });
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(res.data || {}));
  return res.data;
}

export async function checkIn(token, coords = {}) {
  return apiRequest("/field/attendance/check-in", {
    method: "POST",
    token,
    body: coords,
  });
}

export async function checkOut(token, coords = {}) {
  return apiRequest("/field/attendance/check-out", {
    method: "POST",
    token,
    body: coords,
  });
}

export async function pushTracking(token, payload) {
  return apiRequest("/field/tracking/update", {
    method: "POST",
    token,
    body: payload,
  });
}

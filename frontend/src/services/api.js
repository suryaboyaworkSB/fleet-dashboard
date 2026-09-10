import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Fetch live vehicles, optionally filtered by status.
 * @param {string|null} status - "moving" | "idle" | "offline" | null
 */
export const fetchLiveVehicles = async (status = null) => {
  const params = status ? { status } : {};
  const { data } = await apiClient.get("/api/live-vehicles", { params });
  return data;
};

/**
 * Fetch vehicle summary (totals by status).
 */
export const fetchVehicleSummary = async () => {
  const { data } = await apiClient.get("/api/vehicles/summary");
  return data;
};

/**
 * Fetch a single vehicle by ID.
 */
export const fetchVehicleById = async (id) => {
  const { data } = await apiClient.get(`/api/vehicles/${id}`);
  return data;
};

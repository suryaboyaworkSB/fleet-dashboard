import { useState, useEffect, useCallback, useRef } from "react";
import { fetchLiveVehicles, fetchVehicleSummary } from "../services/api";

const POLL_INTERVAL_MS = 5000;

/**
 * Custom hook: polls the backend for live vehicles + summary every 5 seconds.
 */
export function useFleetData(statusFilter = null) {
  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState({ total: 0, moving: 0, idle: 0, offline: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [vehicleData, summaryData] = await Promise.all([
        fetchLiveVehicles(statusFilter),
        fetchVehicleSummary(),
      ]);
      setVehicles(vehicleData);
      setSummary(summaryData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to connect to Fleet API";
      setError(msg);
      console.error("Fleet fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  return { vehicles, summary, loading, error, lastUpdated, refetch: fetchData };
}

import React, { useState } from "react";
import Header from "./components/Header";
import KPIGrid from "./components/KPIGrid";
import FleetMapPanel from "./components/FleetMapPanel";
import SpeedingAlerts from "./components/SpeedingAlerts";
import ChartsSection from "./components/ChartsSection";
import TechnicianTable from "./components/TechnicianTable";
import InventoryPanels from "./components/InventoryPanels";
import { useFleetData } from "./hooks/useFleetData";
import "./App.css";

export default function App() {
  const [filters, setFilters] = useState({
    dateRange: "This Week",
    district: "All",
    tech: "All",
    vehicle: "All",
  });

  const handleFilterChange = (key, val) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const { vehicles, summary, loading, error, lastUpdated } = useFleetData();

  // Apply vehicle filter if selected
  const filtered =
    filters.vehicle === "All"
      ? vehicles
      : vehicles.filter((v) => v.name.includes(filters.vehicle));

  return (
    <div className="app">
      <Header
        filters={filters}
        onFilterChange={handleFilterChange}
        lastUpdated={lastUpdated}
        error={error}
      />

      <div className="main-content">
        {/* Row 1: KPI cards */}
        <KPIGrid summary={summary} vehicles={filtered} />

        {/* Row 2: Map + Speeding Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          <FleetMapPanel vehicles={filtered} />
          <SpeedingAlerts vehicles={filtered} />
        </div>

        {/* Row 3: Charts + Exceptions */}
        <ChartsSection vehicles={filtered} />

        {/* Row 4: Technician table */}
        <TechnicianTable vehicles={filtered} />

        {/* Row 5: Inventory */}
        <InventoryPanels vehicles={filtered} />

        {/* Loading / error banner */}
        {loading && (
          <div style={{
            position: "fixed", bottom: 20, right: 24,
            background: "#0f172a", color: "#94a3b8",
            padding: "10px 18px", borderRadius: 8, fontSize: "0.8rem", zIndex: 9999
          }}>
            ⟳ Fetching fleet data…
          </div>
        )}
        {error && (
          <div style={{
            position: "fixed", bottom: 20, right: 24,
            background: "#fef2f2", border: "1px solid #fca5a5",
            color: "#dc2626", padding: "10px 18px", borderRadius: 8,
            fontSize: "0.8rem", zIndex: 9999
          }}>
            ⚠ {error}
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import "./Sidebar.css";

const STATUS_OPTIONS = [
  { value: null, label: "All Vehicles" },
  { value: "moving", label: "Moving" },
  { value: "idle", label: "Idle" },
  { value: "offline", label: "Offline" },
];

function StatusBadge({ status }) {
  const colors = {
    moving: "#22c55e",
    idle: "#eab308",
    offline: "#ef4444",
  };
  return (
    <span
      className="status-dot"
      style={{ background: colors[status] || "#888" }}
    />
  );
}

export default function Sidebar({
  summary,
  vehicles,
  statusFilter,
  onFilterChange,
  selectedVehicleId,
  onSelectVehicle,
  lastUpdated,
  error,
}) {
  const formatTime = (date) =>
    date ? date.toLocaleTimeString() : "—";

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h1>🚛 Fleet Dashboard</h1>
        <span className={`live-badge ${error ? "error" : "live"}`}>
          {error ? "⚠ Offline" : "● LIVE"}
        </span>
      </div>

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card total">
          <div className="summary-number">{summary.total}</div>
          <div className="summary-label">Total</div>
        </div>
        <div className="summary-card moving">
          <div className="summary-number">{summary.moving}</div>
          <div className="summary-label">Moving</div>
        </div>
        <div className="summary-card idle">
          <div className="summary-number">{summary.idle}</div>
          <div className="summary-label">Idle</div>
        </div>
        <div className="summary-card offline">
          <div className="summary-number">{summary.offline}</div>
          <div className="summary-label">Offline</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            className={`filter-tab ${statusFilter === opt.value ? "active" : ""}`}
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Vehicle list */}
      <div className="vehicle-list">
        {vehicles.length === 0 ? (
          <div className="no-vehicles">
            {error ? error : "No vehicles found"}
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className={`vehicle-item ${selectedVehicleId === v.id ? "selected" : ""}`}
              onClick={() => onSelectVehicle(v.id === selectedVehicleId ? null : v.id)}
            >
              <StatusBadge status={v.status} />
              <div className="vehicle-info">
                <div className="vehicle-name">{v.name}</div>
                <div className="vehicle-meta">
                  {v.speed.toFixed(0)} mph · {v.status}
                </div>
                {v.address && (
                  <div className="vehicle-address">{v.address}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        Updated: {formatTime(lastUpdated)} · Polls every 5s
      </div>
    </aside>
  );
}

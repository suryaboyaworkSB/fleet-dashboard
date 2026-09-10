import React, { useState } from "react";
import "./Header.css";

const FILTER_OPTIONS = {
  dateRange: ["This Week", "Today", "Last 7 Days", "This Month"],
  district: ["All", "North", "South", "East", "West"],
  tech: ["All", "Vic G.", "Leea K.", "Surya B.", "Jon F."],
  vehicle: ["All", "Van 04", "Van 08", "Van 12", "Van 03"],
};

export default function Header({ filters, onFilterChange, lastUpdated, error }) {
  return (
    <header className="otm-header">
      <div className="header-inner">
        <div className="header-left">
          <div className="header-org">OFFICE OF TRAVEL MONITORING</div>
          <h1 className="header-title">Management Operations Dashboard</h1>
          <p className="header-desc">
            Unified fleet, technician productivity, count operations, and inventory
            visibility with Verizon Connect Reveal integration.
          </p>
        </div>

        <div className="header-filters">
          {Object.entries(FILTER_OPTIONS).map(([key, opts]) => (
            <div className="filter-block" key={key}>
              <div className="filter-label">
                {key === "dateRange" ? "DATE RANGE" : key.toUpperCase()}
              </div>
              <select
                className="filter-select"
                value={filters[key]}
                onChange={(e) => onFilterChange(key, e.target.value)}
              >
                {opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="header-bar">
        <span className={`status-pill ${error ? "error" : "live"}`}>
          {error ? "⚠ Connection Error" : "● LIVE"}
        </span>
        {lastUpdated && (
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </header>
  );
}

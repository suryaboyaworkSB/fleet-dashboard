import React from "react";
import "./KPIGrid.css";

function KPICard({ label, value, sub, highlight }) {
  return (
    <div className={`kpi-card ${highlight ? "kpi-highlight" : ""}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

export default function KPIGrid({ summary, vehicles }) {
  const speedAlerts = vehicles.filter((v) => v.speed > 55).length;
  const milesTotal = vehicles
    .reduce((acc, v) => acc + (v.odometer || v.speed * 0.083), 0)
    .toFixed(0);

  const kpis = [
    {
      label: "TECHNICIANS ACTIVE",
      value: summary.moving + summary.idle,
      sub: `${summary.moving} in field / ${summary.idle} idle`,
    },
    {
      label: "COUNTS SET TODAY",
      value: "—",
      sub: "Pending count log integration",
    },
    {
      label: "COUNTS PICKED UP",
      value: "—",
      sub: "Pending count log integration",
    },
    {
      label: "SPEED ALERTS",
      value: speedAlerts,
      sub: `${speedAlerts} unresolved`,
      highlight: speedAlerts > 0,
    },
    {
      label: "MILES TRAVELED",
      value: summary.total > 0 ? milesTotal : "—",
      sub: "fleet total today",
    },
    {
      label: "HOURS WORKED",
      value: "—",
      sub: "Pending timesheet integration",
    },
    {
      label: "EQUIPMENT ISSUES",
      value: "—",
      sub: "Pending inventory integration",
    },
    {
      label: "TOTAL VEHICLES",
      value: summary.total,
      sub: `${summary.offline} offline`,
    },
  ];

  return (
    <div className="kpi-grid">
      {kpis.map((k) => (
        <KPICard key={k.label} {...k} />
      ))}
    </div>
  );
}

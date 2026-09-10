import React, { useState } from "react";
import "./TechnicianTable.css";

function exportCSV(rows) {
  const header = ["Technician", "Hours", "Miles", "Speed Alerts", "Status", "Utilization"];
  const lines = [header.join(","), ...rows.map((r) =>
    [r.name, r.hours, r.miles, r.alerts, r.status, r.utilization].join(",")
  )];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "technicians.csv"; a.click();
  URL.revokeObjectURL(url);
}

function utilLabel(miles) {
  if (miles > 60) return "High";
  if (miles > 40) return "Medium";
  return "Low";
}

export default function TechnicianTable({ vehicles }) {
  const [sortKey, setSortKey] = useState("miles");
  const [sortDir, setSortDir] = useState("desc");
 
  const rows = vehicles.map((v) => ({
    id: v.id,
    name: v.driver || v.name,
    hours: (7 + Math.random()).toFixed(1),
    miles: Math.round(v.speed * 0.5 + 30),
    alerts: v.speed > 55 ? 1 : 0,
    status: v.status,
    utilization: utilLabel(Math.round(v.speed * 0.5 + 30)),
  }));

  const sorted = [...rows].sort((a, b) => {
    const av = isNaN(a[sortKey]) ? a[sortKey] : Number(a[sortKey]);
    const bv = isNaN(b[sortKey]) ? b[sortKey] : Number(b[sortKey]);
    return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const cols = [
    { key: "name", label: "Technician" },
    { key: "hours", label: "Hours" },
    { key: "miles", label: "Miles" },
    { key: "alerts", label: "Speed Alerts" },
    { key: "status", label: "Status" },
    { key: "utilization", label: "Utilization" },
  ];

  return (
    <div className="card tech-table-card">
      <div className="tech-table-header">
        <div>
          <div className="card-title">TECHNICIAN PRODUCTIVITY TABLE</div>
          <div className="card-subtitle">Sortable by hours, miles, and alerts</div>
        </div>
        <button className="export-btn" onClick={() => exportCSV(sorted)}>
          Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="table-empty">No vehicle data — waiting for Verizon API…</div>
      ) : (
        <div className="table-wrap">
          <table className="tech-table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.key} onClick={() => handleSort(c.key)} className={sortKey === c.key ? "sorted" : ""}>
                    {c.label} {sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id}>
                  <td className="td-name">{r.name}</td>
                  <td>{r.hours}</td>
                  <td>{r.miles}</td>
                  <td>
                    <span className={`alert-badge ${r.alerts > 0 ? "has-alert" : ""}`}>
                      {r.alerts}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <span className={`util-badge ${r.utilization.toLowerCase()}`}>
                      {r.utilization}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

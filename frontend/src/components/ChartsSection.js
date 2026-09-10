import React from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area,
} from "recharts";
import "./ChartsSection.css";

// Mock daily data — replace with real count log API when available
const COUNTS_DATA = [
  { day: "Mon", set: 14, picked: 11 },
  { day: "Tue", set: 16, picked: 14 },
  { day: "Wed", set: 18, picked: 15 },
  { day: "Thu", set: 12, picked: 12 },
  { day: "Fri", set: 20, picked: 17 },
];

function CountsChart() {
  return (
    <div className="card chart-card">
      <div className="card-title">COUNTS SET VS PICKED UP</div>
      <div className="card-subtitle">Daily trend by technician and count type</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={COUNTS_DATA} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="set" name="Set" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="picked" name="Picked Up" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MilesHoursChart({ vehicles }) {
  // Build per-vehicle data from live vehicles
  const data = vehicles.slice(0, 6).map((v) => ({
    name: v.name.replace("Van ", "Van\n"),
    miles: Math.round(v.speed * 0.5 + 20),
    hours: (7 + Math.random() * 2).toFixed(1),
  }));

  return (
    <div className="card chart-card">
      <div className="card-title">MILES &amp; HOURS BY TECHNICIAN</div>
      <div className="card-subtitle">Compare productivity, travel, and workload balance</div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="miles" name="Miles" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="hours" name="Hours" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ExceptionsPanel({ vehicles }) {
  const exceptions = [];

  const offline = vehicles.filter((v) => v.status === "offline");
  offline.forEach((v) => exceptions.push(`Vehicle offline: ${v.name}`));

  const speeding = vehicles.filter((v) => v.speed > 55);
  speeding.forEach((v) => exceptions.push(`Mileage spike: ${v.name} at ${v.speed.toFixed(0)} mph`));

  // Static OTM exceptions
  const static_ex = [
    "Pickup overdue at Route 130 / Browning Rd",
    "Tube stock below reorder point at HQ",
  ];
  const all = [...exceptions, ...static_ex].slice(0, 6);

  return (
    <div className="card exceptions-panel">
      <div className="card-title">TODAY'S EXCEPTIONS</div>
      <div className="exceptions-list">
        {all.length === 0 ? (
          <div className="exception-empty">✅ No exceptions today</div>
        ) : (
          all.map((e, i) => (
            <div key={i} className="exception-item">{e}</div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ChartsSection({ vehicles }) {
  return (
    <div className="charts-row">
      <CountsChart />
      <MilesHoursChart vehicles={vehicles} />
      <ExceptionsPanel vehicles={vehicles} />
    </div>
  );
}

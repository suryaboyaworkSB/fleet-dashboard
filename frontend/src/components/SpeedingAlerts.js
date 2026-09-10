import React from "react";
import "./SpeedingAlerts.css";

const SPEED_LIMIT = 55;

export default function SpeedingAlerts({ vehicles }) {
  const alerts = vehicles
    .filter((v) => v.speed > SPEED_LIMIT)
    .sort((a, b) => b.speed - a.speed);

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return "—"; }
  };

  return (
    <div className="card alerts-panel">
      <div className="card-title">SPEEDING / SAFETY ALERTS</div>
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="alerts-empty">✅ No active speed alerts</div>
        ) : (
          alerts.map((v) => (
            <div key={v.id} className="alert-item">
              <div className="alert-row-top">
                <span className="alert-vehicle">{v.name}</span>
                <span className="alert-time">{formatTime(v.last_update)}</span>
              </div>
              {v.driver && <div className="alert-driver">{v.driver}</div>}
              <div className="alert-detail">
                {v.speed.toFixed(0)} mph in {SPEED_LIMIT} zone
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./FleetMapPanel.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const STATUS_COLORS = { moving: "#22c55e", idle: "#f59e0b", offline: "#ef4444" };

function vehicleIcon(status) {
  const color = STATUS_COLORS[status] || "#64748b";
  return L.divIcon({
    className: "",
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill="${color}" opacity="0.2"/>
      <circle cx="16" cy="16" r="8" fill="${color}"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ vehicles }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (vehicles.length > 0 && !fitted.current) {
      map.fitBounds(L.latLngBounds(vehicles.map((v) => [v.lat, v.lng])), {
        padding: [40, 40], maxZoom: 13,
      });
      fitted.current = true;
    }
  }, [vehicles, map]);
  return null;
}

const TILE_LAYERS = {
  Map: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export default function FleetMapPanel({ vehicles }) {
  const [tileMode, setTileMode] = useState("Map");

  return (
    <div className="map-panel card">
      <div className="map-panel-header">
        <div>
          <div className="card-title">FLEET ACTIVITY MAP</div>
          <div className="card-subtitle">Live vehicle positions, count sites, and flagged events</div>
        </div>
        <div className="tile-toggle">
          {Object.keys(TILE_LAYERS).map((mode) => (
            <button
              key={mode}
              className={`tile-btn ${tileMode === mode ? "active" : ""}`}
              onClick={() => setTileMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="map-container-inner">
        {vehicles.length === 0 ? (
          <div className="map-empty">
            <span>Connecting to Verizon fleet data…</span>
          </div>
        ) : (
          <MapContainer center={[39.5, -98.35]} zoom={5} className="leaflet-map-otm">
            <TileLayer url={TILE_LAYERS[tileMode]}
              attribution='&copy; OpenStreetMap contributors' />
            <FitBounds vehicles={vehicles} />
            {vehicles.map((v) => (
              <Marker key={v.id} position={[v.lat, v.lng]} icon={vehicleIcon(v.status)}>
                <Popup>
                  <div className="map-popup">
                    <strong>{v.name}</strong>
                    <div className={`popup-status ${v.status}`}>● {v.status}</div>
                    <div>{v.speed.toFixed(0)} mph</div>
                    {v.driver && <div>👤 {v.driver}</div>}
                    {v.address && <div style={{fontSize:"11px",color:"#666"}}>{v.address}</div>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        <div className="map-legend-otm">
          {Object.entries(STATUS_COLORS).map(([s, c]) => (
            <div key={s} className="legend-row">
              <span className="legend-dot-otm" style={{ background: c }} />
              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

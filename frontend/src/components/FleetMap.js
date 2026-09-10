import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./FleetMap.css";

// Fix missing Leaflet default icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/**
 * Creates a colored SVG circle icon for a vehicle marker.
 */
function createVehicleIcon(status, isSelected = false) {
  const colors = {
    moving: "#22c55e",
    idle: "#eab308",
    offline: "#ef4444",
  };
  const color = colors[status] || "#888";
  const size = isSelected ? 22 : 16;
  const ring = isSelected ? `<circle cx="18" cy="18" r="17" fill="none" stroke="${color}" stroke-width="2" opacity="0.4"/>` : "";

  return L.divIcon({
    className: "",
    html: `
      <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        ${ring}
        <circle cx="18" cy="18" r="${size / 2 + 2}" fill="${color}" opacity="0.25"/>
        <circle cx="18" cy="18" r="${size / 2}" fill="${color}"/>
        <text x="18" y="22" font-size="12" text-anchor="middle" fill="white">🚛</text>
      </svg>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

/**
 * Auto-fit map to show all vehicle markers when the list changes.
 */
function FitBounds({ vehicles }) {
  const map = useMap();
  const prevCount = useRef(0);

  useEffect(() => {
    if (vehicles.length > 0 && vehicles.length !== prevCount.current) {
      const bounds = L.latLngBounds(vehicles.map((v) => [v.lat, v.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      prevCount.current = vehicles.length;
    }
  }, [vehicles, map]);

  return null;
}

/**
 * Pan to a selected vehicle when clicked in the sidebar.
 */
function PanToSelected({ vehicle }) {
  const map = useMap();
  useEffect(() => {
    if (vehicle) {
      map.setView([vehicle.lat, vehicle.lng], Math.max(map.getZoom(), 14), {
        animate: true,
      });
    }
  }, [vehicle, map]);
  return null;
}

export default function FleetMap({ vehicles, selectedVehicleId, onSelectVehicle }) {
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;

  const formatSpeed = (speed) => `${speed.toFixed(1)} mph`;
  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[39.5, -98.35]}
        zoom={5}
        className="leaflet-map"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds vehicles={vehicles} />
        <PanToSelected vehicle={selectedVehicle} />

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createVehicleIcon(vehicle.status, vehicle.id === selectedVehicleId)}
            eventHandlers={{
              click: () =>
                onSelectVehicle(
                  vehicle.id === selectedVehicleId ? null : vehicle.id
                ),
            }}
          >
            <Popup>
              <div className="popup">
                <div className="popup-title">{vehicle.name}</div>
                <div className="popup-row">
                  <span className={`popup-status ${vehicle.status}`}>
                    ● {vehicle.status}
                  </span>
                </div>
                <div className="popup-row">
                  🚀 Speed: <strong>{formatSpeed(vehicle.speed)}</strong>
                </div>
                {vehicle.heading != null && (
                  <div className="popup-row">
                    🧭 Heading: <strong>{vehicle.heading}°</strong>
                  </div>
                )}
                {vehicle.driver && (
                  <div className="popup-row">
                    👤 Driver: <strong>{vehicle.driver}</strong>
                  </div>
                )}
                {vehicle.address && (
                  <div className="popup-row popup-address">
                    📍 {vehicle.address}
                  </div>
                )}
                <div className="popup-row popup-time">
                  🕐 {formatTime(vehicle.last_update)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot moving" /> Moving
        </div>
        <div className="legend-item">
          <span className="legend-dot idle" /> Idle
        </div>
        <div className="legend-item">
          <span className="legend-dot offline" /> Offline
        </div>
      </div>
    </div>
  );
}

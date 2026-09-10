import React from "react";
import "./LoadingOverlay.css";

export default function LoadingOverlay({ message = "Connecting to fleet..." }) {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
}

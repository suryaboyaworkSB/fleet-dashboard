import React from "react";
import "./InventoryPanels.css";

const EQUIPMENT = [
  { vehicle: "Van 12", items: "2 tube kits, 1 classifier, 1 camera" },
  { vehicle: "Van 08", items: "1 tube kit, 2 ped counters" },
  { vehicle: "Van 04", items: "1 camera, 1 radar unit" },
];

const SUPPLIES = [
  { name: "Batteries",  count: 24, reorder: 20 },
  { name: "Tube Sets",  count: 11, reorder: 8  },
  { name: "Nails",      count: 2,  reorder: 4  },
  { name: "Locks",      count: 15, reorder: 10 },
];

export default function InventoryPanels({ vehicles }) {
  // Merge real vehicle names into equipment list where possible
  const vehicleNames = vehicles.slice(0, 3).map((v) => v.name);
  const equipment = EQUIPMENT.map((e, i) => ({
    ...e,
    vehicle: vehicleNames[i] || e.vehicle,
  }));

  return (
    <div className="inventory-row two-col">
      {/* Vehicle Equipment */}
      <div className="card">
          <div className="card-title">VEHICLE EQUIPMENT INVENTORY</div>
          <table className="inv-table">
            <tbody>
              {equipment.map((e) => (
                <tr key={e.vehicle}>
                  <td className="inv-vehicle">{e.vehicle}</td>
                  <td className="inv-items">{e.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Supply Inventory */}
      <div className="card">
          <div className="card-title">SUPPLY INVENTORY</div>
          <table className="inv-table">
            <tbody>
            {SUPPLIES.map((s) => (
                <tr key={s.name}>
                  <td className="inv-vehicle">{s.name}</td>
                  <td className={`inv-count ${s.count <= s.reorder ? "low-stock" : ""}`}>
                    {s.count} / Reorder at {s.reorder}
                    {s.count <= s.reorder && <span className="low-badge"> ⚠ Low</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}

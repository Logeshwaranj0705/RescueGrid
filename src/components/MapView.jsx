import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix leaflet marker icons in Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 0.9 });
  }, [center, map]);
  return null;
}

export default function MapView({ shelters, selected }) {
  const center = selected ? [selected.lat, selected.lng] : [13.0827, 80.2707];

  return (
    <div className="h-[420px] md:h-[640px] rounded-2xl overflow-hidden border border-white/10 shadow-glow">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
        <FlyTo center={center} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <div className="text-black">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs">Occupancy: {s.capacityUsed}/{s.capacityTotal} ({s.occupancyPct}%)</div>
                <div className="text-xs">Safety: {s.safety}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ShelterMap({ shelters, selected }) {
  const center = selected ? [selected.lat, selected.lng] : [13.0827, 80.2707];

  return (
    <div className="h-[460px] md:h-[680px] rounded-3xl overflow-hidden border border-white/10 shadow-glow">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <div className="text-black">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs">Capacity: {s.capacityUsed}/{s.capacityTotal}</div>
                <div className="text-xs">Risk: {s.risk}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

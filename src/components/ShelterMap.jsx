import { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };
const LIBRARIES = ["places"]; // ✅ static (prevents LoadScript reload warning)

export default function ShelterMap({ shelters, userLoc, selected, best }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);

  // ✅ LIVE location state (starts with initial userLoc if provided)
  const [liveLoc, setLiveLoc] = useState(userLoc || null);
  const watchIdRef = useRef(null);

  // keep liveLoc in sync if parent updates userLoc once
  useEffect(() => {
    if (userLoc) setLiveLoc(userLoc);
  }, [userLoc]);

  // ✅ Watch GPS for live updates
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("GPS watch error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ✅ Route target: selected first, else best (recommended default)
  const routeTarget = useMemo(() => {
    if (selected?.lat != null && selected?.lng != null) return selected;
    if (best?.lat != null && best?.lng != null) return best;
    return null;
  }, [selected, best]);

  // ✅ Center logic: target > liveLoc > default
  const center = useMemo(() => {
    if (routeTarget) return { lat: routeTarget.lat, lng: routeTarget.lng };
    if (liveLoc) return { lat: liveLoc.lat, lng: liveLoc.lng };
    return DEFAULT_CENTER;
  }, [routeTarget, liveLoc]);

  // ✅ Fetch directions whenever liveLoc or routeTarget changes
  useEffect(() => {
    if (!isLoaded) return;

    if (!liveLoc || !routeTarget) {
      setDirections(null);
      return;
    }

    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin: liveLoc,
        destination: { lat: routeTarget.lat, lng: routeTarget.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) setDirections(result);
        else setDirections(null);
      }
    );
  }, [isLoaded, liveLoc, routeTarget]);

  // ✅ Fit bounds to route (or at least user+target)
  useEffect(() => {
    if (!map || !isLoaded) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (directions?.routes?.[0]?.overview_path?.length) {
      directions.routes[0].overview_path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);
      return;
    }

    if (liveLoc) bounds.extend(liveLoc);
    if (routeTarget) bounds.extend({ lat: routeTarget.lat, lng: routeTarget.lng });

    if (!bounds.isEmpty()) map.fitBounds(bounds);
  }, [map, isLoaded, directions, liveLoc, routeTarget]);

  if (!apiKey) return <div className="text-white/60">Missing API key</div>;
  if (!isLoaded) return <div className="text-white/60">Loading map…</div>;

  return (
    <div className="h-[460px] md:h-[680px] rounded-3xl overflow-hidden border border-white/10 shadow-glow">
      <GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        onLoad={setMap}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* ✅ Live location marker (blue dot style) */}
        {liveLoc && (
          <Marker
            position={liveLoc}
            title="Your live location"
            zIndex={9999}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#93c5fd",
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
        )}

        {/* ✅ Shelter markers */}
        {(shelters || []).map((s) => {
          const isSelected = selected?.id === s.id;
          const isBest = best?.id === s.id;

          return (
            <Marker
              key={s.id}
              position={{ lat: s.lat, lng: s.lng }}
              title={s.name}
              icon={
                isSelected
                  ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  : isBest
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              }
            />
          );
        })}

        {/* ✅ Directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // we use our own markers
              polylineOptions: {
                strokeOpacity: 0.9,
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

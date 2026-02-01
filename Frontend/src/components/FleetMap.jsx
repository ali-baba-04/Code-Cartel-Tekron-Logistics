import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Default icon fix for react-leaflet (webpack/vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const redDestinationIcon = L.divIcon({
  className: "fleet-map-dest-icon",
  html: '<div style="width:24px;height:24px;background:#dc2626;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) {
      map.setView(INDIA_CENTER, DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function FleetMap({ trucks = [] }) {
  const [mapReady, setMapReady] = useState(false);
  const mapKey = useState(
    () => `fleet-map-${Math.random().toString(36).slice(2)}`,
  )[0];

  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const allPoints = useMemo(() => {
    const pts = [];
    trucks.forEach((t) => {
      if (t.currentLocation?.lat != null && t.currentLocation?.lng != null) {
        pts.push([t.currentLocation.lat, t.currentLocation.lng]);
      }
      if (t.destination?.lat != null && t.destination?.lng != null) {
        pts.push([t.destination.lat, t.destination.lng]);
      }
    });
    return pts;
  }, [trucks]);

  if (!mapReady) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        key={mapKey}
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={allPoints} />
        {trucks.flatMap((t) => {
          const els = [];
          const hasLoc =
            t.currentLocation?.lat != null && t.currentLocation?.lng != null;
          const hasDest =
            t.destination?.lat != null && t.destination?.lng != null;

          if (hasLoc && hasDest) {
            els.push(
              <Polyline
                key={`${t._id}-line`}
                positions={[
                  [t.currentLocation.lat, t.currentLocation.lng],
                  [t.destination.lat, t.destination.lng],
                ]}
                pathOptions={{
                  color: "#059669",
                  weight: 3,
                  opacity: 0.8,
                }}
              />,
            );
          }
          if (hasLoc) {
            els.push(
              <Marker
                key={`${t._id}-loc`}
                position={[t.currentLocation.lat, t.currentLocation.lng]}
              >
                <Popup>
                  <strong>Truck {t.truckNumber}</strong>
                  <br />
                  Current location
                </Popup>
              </Marker>,
            );
          }
          if (hasDest) {
            els.push(
              <Marker
                key={`${t._id}-dest`}
                position={[t.destination.lat, t.destination.lng]}
                icon={redDestinationIcon}
              >
                <Popup>
                  <strong>Destination: {t.destination.city || "—"}</strong>
                  <br />
                  Truck {t.truckNumber}
                </Popup>
              </Marker>,
            );
          }
          return els;
        })}
      </MapContainer>
    </div>
  );
}

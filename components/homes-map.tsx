"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { FosterHome } from "@/lib/types";

const dot = (active: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
    html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:${
      active ? "#F59E0B" : "#1B2A4A"
    };border:3px solid #fff;box-shadow:0 2px 8px rgba(27,42,74,.35)"></span>`,
  });

function FitBounds({ homes }: { homes: FosterHome[] }) {
  const map = useMap();
  useEffect(() => {
    if (!homes.length) return;
    if (homes.length === 1) {
      map.flyTo([homes[0].lat, homes[0].lng], 11, { duration: 0.8 });
      return;
    }
    map.flyToBounds(L.latLngBounds(homes.map((h) => [h.lat, h.lng] as [number, number])), {
      padding: [48, 48],
      duration: 0.8,
      maxZoom: 11,
    });
  }, [homes, map]);
  return null;
}

export default function HomesMap({
  homes,
  activeId,
  onSelect,
}: {
  homes: FosterHome[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return (
    <MapContainer
      center={[34.08, -84.2]}
      zoom={10}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#F4F1EC" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="hb-tiles"
      />
      <FitBounds homes={homes} />
      {homes.map((h) => (
        <Marker
          key={h.id}
          position={[h.lat, h.lng]}
          icon={dot(h.id === activeId)}
          eventHandlers={{ click: () => onSelect?.(h.id) }}
        >
          <Popup>
            <div style={{ fontFamily: "inherit" }}>
              <strong style={{ color: "#1B2A4A" }}>{h.name}</strong>
              <br />
              <span style={{ color: "#64799F" }}>{h.area} (approximate)</span>
              <br />
              <a href={`/homes/${h.id}`} style={{ color: "#B45309", fontWeight: 600 }}>
                View needs →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

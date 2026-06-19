"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API, type CaseRecord } from "../lib/api";

const BENGALURU: [number, number] = [12.9716, 77.5946];

/** Forest-tinted teardrop pin built as a divIcon (no broken default assets). */
const pinIcon = L.divIcon({
  className: "sentinel-pin",
  html: `<span class="sentinel-pin-dot"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

export function ImpactMap() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API}/cases`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: CaseRecord[]) => {
        if (active) setCases(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <h3 className="text-xl">Impact map</h3>
        <span className="text-xs text-stone-600">
          {error
            ? "Map of filed cases"
            : `${cases.length} case${cases.length === 1 ? "" : "s"} filed`}
        </span>
      </div>
      <div className="h-[320px] w-full">
        <MapContainer
          center={BENGALURU}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ background: "var(--color-stone-100)" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {cases.map((c) => (
            <Marker
              key={c.tracking_id}
              position={[c.lat, c.lng]}
              icon={pinIcon}
            >
              <Popup>
                <span className="block text-sm font-semibold text-forest">
                  {c.category}
                </span>
                <span className="mt-0.5 block text-xs text-stone-600">
                  {c.authority}
                </span>
                <span className="mt-1 block font-mono text-[11px] text-stone-600">
                  {c.tracking_id}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

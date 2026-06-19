"use client";

import { useEffect, useMemo, useState } from "react";
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

type Status = "loading" | "ready" | "error";

/** Compact "N · category" breakdown from the fetched cases. */
function byCategory(cases: CaseRecord[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const c of cases) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function ImpactMap({ refreshKey }: { refreshKey?: unknown }) {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetch(`${API}/cases`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: CaseRecord[]) => {
        if (!active) return;
        setCases(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const cats = useMemo(() => byCategory(cases), [cases]);
  const empty = status === "ready" && cases.length === 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 pb-3 pt-5">
        <h3 className="text-xl">Impact map</h3>
        <span className="text-xs text-stone-600">
          {status === "error"
            ? "Map of filed cases"
            : status === "loading"
              ? "Loading…"
              : `${cases.length} case${cases.length === 1 ? "" : "s"} filed`}
        </span>
      </div>

      {/* Stats summary — total + by-category breakdown */}
      {status === "ready" && cases.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-6 pb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-1 text-xs font-medium text-forest">
            {cases.length} total
          </span>
          {cats.map(([cat, n]) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-cream px-2.5 py-1 text-xs text-stone-600"
            >
              <span className="font-medium text-forest">{n}</span>
              <span>{cat}</span>
            </span>
          ))}
        </div>
      )}

      <div className="relative h-[320px] w-full">
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
            <Marker key={c.tracking_id} position={[c.lat, c.lng]} icon={pinIcon}>
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

        {/* Loading overlay */}
        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-paper/60 text-sm text-stone-600">
            Loading filed cases…
          </div>
        )}

        {/* Empty state */}
        {empty && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
            <div className="rounded-2xl border border-stone-300 bg-paper/90 px-5 py-4 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-medium text-forest">No cases yet</p>
              <p className="mt-1 text-xs text-stone-600">
                File the first one to put it on the map.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

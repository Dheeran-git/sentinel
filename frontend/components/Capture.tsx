"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { SpotlightCard } from "./reactbits/SpotlightCard";

function UploadGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden
    >
      <path d="M12 16V5" />
      <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
      <path d="M5 16.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1.5" />
    </svg>
  );
}

function PinGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

/** Demo fixtures bundled under /public/samples. Bengaluru default location so
 *  a judge can run a full mission in one click without GPS. */
const SAMPLES = [
  { src: "/samples/ewaste.jpg", label: "E-waste" },
  { src: "/samples/open_burning.jpg", label: "Open burning" },
  { src: "/samples/water_pollution.jpg", label: "Drain pollution" },
  { src: "/samples/garbage.jpg", label: "Garbage" },
  { src: "/samples/debris.jpg", label: "Debris" },
] as const;

const BENGALURU = { lat: 12.9716, lng: 77.5946 };

export function Capture({
  onStart,
  running,
}: {
  onStart: (b64: string, lat?: number, lng?: number) => void;
  running: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(",")[1];
      setPreview(result);
      if (typeof navigator === "undefined" || !navigator.geolocation) { onStart(b64); return; }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          onStart(b64, pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setLocating(false);
          onStart(b64);
        },
        { enableHighAccuracy: true, timeout: 6000 },
      );
    };
    reader.readAsDataURL(file);
  }

  /** Fetch a bundled sample, convert to base64, preview it, and start a mission
   *  at a fixed Bengaluru location (no GPS prompt for one-click demos). */
  async function handleSample(src: string) {
    const blob = await fetch(src).then((r) => r.blob());
    const dataUrl: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    setPreview(dataUrl);
    onStart(dataUrl.split(",")[1], BENGALURU.lat, BENGALURU.lng);
  }

  const busy = running || locating;

  return (
    <SpotlightCard className="card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h3 className="text-xl">Start a case</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-cream px-3 py-1 text-xs text-stone-600">
          <PinGlyph />
          Location captured
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
        Photograph the violation. The agent reads the scene, finds the law, and
        drafts the complaint for your approval.
      </p>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (busy) return;
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`mt-5 block cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-colors duration-200 ${
          dragging
            ? "border-forest-soft bg-stone-100 ring-2 ring-forest-soft/30"
            : "border-stone-300 bg-cream hover:border-forest-soft hover:bg-stone-100"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {preview ? (
          <div className="relative mx-auto w-fit overflow-hidden rounded-xl shadow-[var(--shadow-soft)]">
            <motion.img
              key={preview}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={preview}
              alt="Captured violation"
              className="block max-h-56 w-auto object-cover"
            />
            {running && <span aria-hidden className="scan-sweep" />}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest/10 text-forest">
              <UploadGlyph />
            </span>
            <div>
              <p className="font-medium text-forest">
                {dragging ? "Drop the image" : "Take a photo or drop an image"}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                JPG or PNG. On a phone, the camera opens directly.
              </p>
            </div>
          </div>
        )}
      </label>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy
          ? locating
            ? "Reading your location…"
            : "Mission in progress…"
          : preview
            ? "Use another photo"
            : "Capture the violation"}
      </button>

      {/* ── Try a sample ─────────────────────────────────── */}
      <div className="mt-6 border-t border-stone-300/70 pt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-600">
          Try a sample
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.src}
              type="button"
              disabled={busy}
              onClick={() => handleSample(s.src)}
              title={`Run ${s.label}`}
              className="group flex flex-col items-center gap-1.5 rounded-lg text-center transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="block w-full overflow-hidden rounded-lg border border-stone-300 transition-[border-color,box-shadow] duration-200 group-hover:border-forest-soft group-hover:shadow-[0_4px_14px_-6px_rgba(20,83,45,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.label}
                  loading="lazy"
                  className="aspect-square h-full w-full object-cover"
                />
              </span>
              <span className="text-[10px] leading-tight text-stone-600 group-hover:text-forest sm:text-[11px]">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-stone-600">
        Nothing is filed without you. You approve every action before it is sent.
      </p>
    </SpotlightCard>
  );
}

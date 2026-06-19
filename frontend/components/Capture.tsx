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
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`mt-5 block cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-colors duration-200 ${
          dragging
            ? "border-forest-soft bg-stone-100"
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
          <motion.img
            key={preview}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={preview}
            alt="Captured violation"
            className="mx-auto max-h-56 w-auto rounded-xl object-cover shadow-[var(--shadow-soft)]"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest/10 text-forest">
              <UploadGlyph />
            </span>
            <div>
              <p className="font-medium text-forest">
                Take a photo or drop an image
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

      <p className="mt-3 text-center text-xs text-stone-600">
        Nothing is filed without you. You approve every action before it is sent.
      </p>
    </SpotlightCard>
  );
}

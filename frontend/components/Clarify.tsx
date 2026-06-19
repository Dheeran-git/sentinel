"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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

export function Clarify({
  question,
  onResume,
  running,
}: {
  question: string;
  onResume: (value: unknown) => void;
  running: boolean;
}) {
  const [text, setText] = useState("");
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onResume({ location: [pos.coords.latitude, pos.coords.longitude] });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }

  const busy = running || locating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card border-clay/30 p-6 sm:p-7"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clay">
        The agent needs a detail
      </span>
      <p
        className="mt-3 text-lg leading-snug text-forest"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {question}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={useMyLocation}
          className="btn-ghost w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PinGlyph />
          {locating ? "Reading location…" : "Use my location"}
        </button>

        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="h-px flex-1 bg-stone-300" />
          or type an answer
          <span className="h-px flex-1 bg-stone-300" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) onResume(text.trim());
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
            placeholder="e.g. Near the market entrance on 5th Cross"
            className="flex-1 rounded-[14px] border border-stone-300 bg-paper px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-600/70 focus:border-forest-soft disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send answer
          </button>
        </form>
      </div>
    </motion.div>
  );
}

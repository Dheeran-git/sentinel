"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "./reactbits/CountUp";

/** Split a tracking id into a leading text part and a trailing numeric run. */
function splitTracking(id: string): { head: string; num: number | null } {
  const m = id.match(/^(.*?)(\d+)$/);
  if (!m || m[2].length > 9) return { head: id, num: null };
  return { head: m[1], num: parseInt(m[2], 10) };
}

function CheckBurst({ reduced }: { reduced: boolean }) {
  return (
    <motion.span
      initial={reduced ? false : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      className="grid h-16 w-16 place-items-center rounded-full bg-forest text-cream shadow-[0_8px_24px_rgba(20,83,45,0.25)]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8"
        aria-hidden
      >
        <motion.path
          d="m5 12.5 4 4 10-10"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
  );
}

function StepDot({ filled }: { filled: boolean }) {
  return (
    <span className="relative mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
      <span
        className={`h-3 w-3 rounded-full border-2 ${
          filled
            ? "border-forest bg-forest"
            : "border-stone-300 bg-paper"
        }`}
      />
    </span>
  );
}

export function Result({
  trackingId,
  authority,
  onFileAnother,
}: {
  trackingId: string;
  authority?: string;
  onFileAnother?: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const { head, num } = splitTracking(trackingId);

  const timeline = [
    { label: "Logged & tracked", done: true },
    {
      label: authority ? `Routed to ${authority}` : "Routed to the authority",
      done: true,
    },
    { label: "Awaiting action", done: false },
  ];

  function fileAnother() {
    onFileAnother?.();
    document
      .getElementById("case")
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card flex flex-col items-center p-7 text-center sm:p-8"
    >
      <CheckBurst reduced={reduced} />
      <h3 className="mt-5 text-2xl">Filed (demo-safe)</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-600">
        Your complaint and evidence dossier are prepared and tracked. In
        production this lands with the right authority.
      </p>

      <div className="mt-6 w-full rounded-2xl border border-stone-300 bg-cream px-6 py-5">
        <p className="text-xs uppercase tracking-widest text-stone-600">
          Tracking ID
        </p>
        <motion.p
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-1.5 break-all text-2xl text-forest sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {num !== null ? (
            <>
              {head}
              <CountUp value={num} duration={reduced ? 0 : 1100} plain />
            </>
          ) : (
            trackingId
          )}
        </motion.p>
      </div>

      {/* What happens next — calm mini-timeline */}
      <div className="mt-6 w-full text-left">
        <p className="text-xs uppercase tracking-widest text-stone-600">
          What happens next
        </p>
        <ol className="mt-3 space-y-3">
          {timeline.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <StepDot filled={s.done} />
              <span
                className={`text-sm leading-snug ${
                  s.done ? "text-stone-900" : "text-stone-600"
                }`}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <button
        type="button"
        onClick={fileAnother}
        className="btn-ghost mt-7 w-full justify-center sm:w-auto"
      >
        File another
      </button>
    </motion.div>
  );
}

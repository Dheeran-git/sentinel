"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Step } from "../lib/api";
import type { JSX } from "react";

const glyph = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4",
};

function EyeIcon() {
  return (
    <svg {...glyph}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg {...glyph}>
      <path d="M12 3v17M6 20h12M5 7h14" />
      <path d="M5 7 2.7 12h4.6L5 7ZM19 7l-2.3 5h4.6L19 7Z" />
    </svg>
  );
}
function ToolsIcon() {
  return (
    <svg {...glyph}>
      <path d="M14.5 5.5a3.5 3.5 0 0 0-4.8 4.4L4 15.6 6.4 18l5.7-5.7a3.5 3.5 0 0 0 4.4-4.8l-2.2 2.2-1.8-1.8 2-2Z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg {...glyph}>
      <path d="M12 3 5 6v5c0 4.3 3 7.5 7 9 4-1.5 7-4.7 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg {...glyph}>
      <path d="M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5" />
      <path d="M9 14.5 6.5 12c.5-4 3.5-8 9-9 .5 5.5-3 8.5-7 9Z" />
      <circle cx="14.5" cy="9.5" r="1.4" />
    </svg>
  );
}

/* ── Five canonical mission stages ───────────────────────────── */
type StageKey = "perceive" | "investigate" | "act" | "approve" | "execute";

const STAGES: { key: StageKey; label: string; Icon: () => JSX.Element }[] = [
  { key: "perceive", label: "Perceive", Icon: EyeIcon },
  { key: "investigate", label: "Investigate", Icon: ScaleIcon },
  { key: "act", label: "Act", Icon: ToolsIcon },
  { key: "approve", label: "Approve", Icon: ShieldIcon },
  { key: "execute", label: "Execute", Icon: RocketIcon },
];

const STAGE_INDEX: Record<StageKey, number> = {
  perceive: 0,
  investigate: 1,
  act: 2,
  approve: 3,
  execute: 4,
};

/** Map a raw step.node to its parent stage. clarify/refine are sub-events. */
function stageOf(node: string): StageKey {
  const n = node?.toLowerCase?.() ?? "";
  if (n === "clarify") return "perceive";
  if (n === "refine") return "act";
  if (n in STAGE_INDEX) return n as StageKey;
  return "investigate";
}

type Grouped = {
  /** Primary reasoning text for the stage (latest matching primary step). */
  text: string;
  /** Sub-events (clarify / refine) shown inline under the stage. */
  subs: { label: string; text: string }[];
  /** Whether any step has reached this stage. */
  reached: boolean;
};

export function MissionFeed({
  steps,
  running,
}: {
  steps: Step[];
  running: boolean;
}) {
  const reduce = useReducedMotion();

  // Bucket steps into their stages.
  const grouped: Record<StageKey, Grouped> = {
    perceive: { text: "", subs: [], reached: false },
    investigate: { text: "", subs: [], reached: false },
    act: { text: "", subs: [], reached: false },
    approve: { text: "", subs: [], reached: false },
    execute: { text: "", subs: [], reached: false },
  };

  let activeStage: StageKey = "perceive";
  let furthest = -1;

  for (const step of steps) {
    const n = step.node?.toLowerCase?.() ?? "";
    const stage = stageOf(step.node);
    const g = grouped[stage];
    g.reached = true;
    if (n === "clarify") g.subs.push({ label: "Clarify", text: step.text });
    else if (n === "refine") g.subs.push({ label: "Refine", text: step.text });
    else g.text = step.text;

    activeStage = stage;
    furthest = Math.max(furthest, STAGE_INDEX[stage]);
  }

  // Connector fill: proportion of stages completed (0–1). When running, the
  // active stage counts as in-progress so the line eases toward it.
  const denom = STAGES.length - 1;
  const fill = furthest < 0 ? 0 : Math.min(1, (furthest + (running ? 0.5 : 1)) / (denom + 1));

  return (
    <div className="card p-6 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl">Mission feed</h3>
        <span className="inline-flex items-center gap-2 text-xs text-stone-600">
          <span
            className={`h-2 w-2 rounded-full ${
              running ? "animate-pulse bg-clay" : "bg-forest-soft"
            }`}
          />
          {running ? "Agent working" : "Live"}
        </span>
      </div>

      <ol className="relative ml-1">
        {/* Connector: stone track + forest fill that grows as stages complete */}
        <span
          aria-hidden
          className="absolute bottom-4 left-[19px] top-4 w-[2px] rounded-full bg-stone-300/70"
        />
        <motion.span
          aria-hidden
          className="absolute left-[19px] top-4 w-[2px] origin-top rounded-full bg-gradient-to-b from-forest to-forest-soft"
          style={{ bottom: 16 }}
          initial={false}
          animate={{ scaleY: fill }}
          transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        />

        {STAGES.map((stage) => {
          const g = grouped[stage.key];
          const idx = STAGE_INDEX[stage.key];
          const isActive = running && stage.key === activeStage;
          const done = g.reached && !isActive;
          const pending = !g.reached;
          const Icon = stage.Icon;

          return (
            <li key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Node chip */}
              <span
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
                  isActive
                    ? "border-clay bg-clay/10 text-clay"
                    : done
                      ? "border-forest bg-forest text-cream"
                      : "border-stone-300 bg-paper text-stone-600"
                }`}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-clay"
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={
                      reduce
                        ? { opacity: 0.6 }
                        : { opacity: 0, scale: 1.7 }
                    }
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
                <Icon />
              </span>

              {/* Stage content */}
              <div className="min-w-0 pt-1.5">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      pending ? "text-stone-600" : "text-forest"
                    }`}
                  >
                    {stage.label}
                  </p>
                  <span className="text-[10px] font-medium tracking-widest text-stone-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {isActive && (
                    <span className="ml-0.5 flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay" />
                    </span>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {g.text && (
                    <motion.p
                      key={g.text}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-1 text-sm leading-relaxed text-stone-600"
                    >
                      {g.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Sub-events: clarify / refine */}
                <AnimatePresence initial={false}>
                  {g.subs.map((sub, si) => (
                    <motion.div
                      key={`${sub.label}-${si}-${sub.text.slice(0, 12)}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-2 flex gap-2 rounded-lg border border-stone-300/70 bg-cream/60 px-3 py-2"
                    >
                      <span className="mt-px text-[10px] font-medium uppercase tracking-wider text-clay">
                        {sub.label}
                      </span>
                      <span className="text-xs leading-relaxed text-stone-600">
                        {sub.text}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

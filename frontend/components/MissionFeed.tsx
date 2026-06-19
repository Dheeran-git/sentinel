"use client";

import { AnimatePresence, motion } from "framer-motion";
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
function QuestionIcon() {
  return (
    <svg {...glyph}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2-2.3 3.4" />
      <path d="M12 17.2h.01" />
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
function PenIcon() {
  return (
    <svg {...glyph}>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
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

const NODE_META: Record<string, { label: string; Icon: () => JSX.Element }> = {
  perceive: { label: "Perceive", Icon: EyeIcon },
  clarify: { label: "Clarify", Icon: QuestionIcon },
  investigate: { label: "Investigate", Icon: ScaleIcon },
  act: { label: "Act", Icon: ToolsIcon },
  approve: { label: "Approve", Icon: ShieldIcon },
  refine: { label: "Refine", Icon: PenIcon },
  execute: { label: "Execute", Icon: RocketIcon },
};

function metaFor(node: string) {
  return (
    NODE_META[node?.toLowerCase?.()] ?? {
      label: node ? node[0].toUpperCase() + node.slice(1) : "Step",
      Icon: ScaleIcon,
    }
  );
}

export function MissionFeed({
  steps,
  running,
}: {
  steps: Step[];
  running: boolean;
}) {
  return (
    <div className="card p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
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
        {/* Forest connector line */}
        <span
          aria-hidden
          className="absolute bottom-2 left-[15px] top-2 w-px bg-gradient-to-b from-forest/30 via-forest/20 to-transparent"
        />
        <AnimatePresence initial={false}>
          {steps.map((step, i) => {
            const { label, Icon } = metaFor(step.node);
            const last = i === steps.length - 1;
            return (
              <motion.li
                key={`${step.node}-${step.ts}-${i}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-3.5 pb-5 last:pb-1"
              >
                <span
                  className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                    last && running
                      ? "border-clay/40 bg-clay/10 text-clay"
                      : "border-forest/20 bg-paper text-forest"
                  }`}
                >
                  <Icon />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-forest">{label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-600">
                    {step.text}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {running && (
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex items-center gap-3.5 pl-[2px]"
          >
            <span className="relative z-10 ml-[2px] flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-soft [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-soft [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-forest-soft" />
            </span>
            <span className="text-xs text-stone-600">Thinking…</span>
          </motion.li>
        )}
      </ol>
    </div>
  );
}

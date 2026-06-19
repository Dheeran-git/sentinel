"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import { BlurText } from "./reactbits/BlurText";
import { CountUp } from "./reactbits/CountUp";

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M5 12h11" />
      <path d="m12.5 8 4 4-4 4" />
      <path d="M20 4v16" />
    </svg>
  );
}

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Three compact, on-brand stats. The cases count is fetched live; the strip
 *  hides entirely if the fetch fails so it never shows a broken state. */
function StatStrip() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API}/cases`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: unknown[]) => {
        if (active) setCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (failed) return null;

  const stats = [
    {
      value:
        count === null ? (
          <span className="text-stone-300">—</span>
        ) : (
          <CountUp value={count} />
        ),
      label: count === 1 ? "case filed" : "cases filed",
    },
    { value: "5", label: "violation types" },
    { value: "Real law", label: "every complaint grounded" },
  ];

  return (
    <motion.dl
      variants={rise}
      className="mt-10 grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-4"
    >
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl border border-stone-300/70 bg-paper/70 px-3 py-3.5 text-center backdrop-blur-sm sm:px-4"
        >
          <dd className="text-xl font-semibold text-forest sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {s.value}
          </dd>
          <dt className="mt-1 text-[11px] leading-tight text-stone-600 sm:text-xs">
            {s.label}
          </dt>
        </div>
      ))}
    </motion.dl>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export function Hero() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex w-full flex-col items-center text-center"
    >
      <motion.div
        variants={rise}
        className="mb-7 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-paper/80 px-4 py-1.5 text-sm text-stone-600 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-clay" />
        A civic environmental agent
      </motion.div>

      <BlurText
        as="h1"
        className="max-w-4xl text-balance text-4xl leading-[1.05] sm:text-6xl lg:text-7xl"
        text={[
          "Report",
          "a",
          "civic",
          "environmental",
          "violation.",
          <span key="emph" className="italic text-forest-soft">
            Watch an agent act on it.
          </span>,
        ]}
      />

      <motion.p
        variants={rise}
        className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-stone-600"
      >
        Snap a photo of dumping, burning, or a choked drain. SENTINEL finds the
        law it breaks, drafts the complaint to the right authority, and waits
        for your approval before it acts.
      </motion.p>

      <motion.div
        variants={rise}
        id="start"
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <a href="#case" className="btn-primary w-full sm:w-auto">
          Open a case
          <SendIcon />
        </a>
        <a href="#how" className="btn-ghost w-full sm:w-auto">
          See how it works
        </a>
      </motion.div>

      <motion.p variants={rise} className="mt-5 text-sm text-stone-600">
        No account needed to start. You approve every action before it is sent.
      </motion.p>

      <StatStrip />
    </motion.div>
  );
}

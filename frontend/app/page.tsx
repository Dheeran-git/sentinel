"use client";

import { motion, type Variants } from "framer-motion";

/* ── Brand mark ───────────────────────────────────────────── */
function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M20 4C9 4 4 10.5 4 17c0 1.2.2 2.3.5 3 .3-3.7 2.4-7.4 6-9.6 2.7-1.7 6-2.6 9.5-2.9-2.8 1-5 2.4-6.6 4-2 2-3 4.4-3.4 7 3.8.2 7-.7 9.3-3C28 11 22 4 20 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-cream shadow-[0_2px_10px_rgba(20,83,45,0.18)]">
        <Leaf className="h-5 w-5" />
      </span>
      <span
        className="text-xl font-semibold tracking-tight text-forest"
        style={{ fontFamily: "var(--font-display)" }}
      >
        SENTINEL
      </span>
    </div>
  );
}

/* ── Step icons (inline, no stock art) ────────────────────── */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CameraIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2l1-1.6A1.5 1.5 0 0 1 9 3.7h6a1.5 1.5 0 0 1 1.3.7l1 1.6h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M12 3v17" />
      <path d="M6 20h12" />
      <path d="M5 7h14" />
      <path d="M5 7 2.5 12.5h5L5 7Z" />
      <path d="M19 7l-2.5 5.5h5L19 7Z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M5 12h11" />
      <path d="m12.5 8 4 4-4 4" />
      <path d="M20 4v16" />
    </svg>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Snap",
    body: "Photograph the violation. Location and time are captured with it.",
    Icon: CameraIcon,
  },
  {
    n: "02",
    title: "Identify in law",
    body: "The agent matches what it sees to the exact statute and clause.",
    Icon: ScaleIcon,
  },
  {
    n: "03",
    title: "Draft action",
    body: "A formal complaint to the right authority is written for you.",
    Icon: PenIcon,
  },
  {
    n: "04",
    title: "Approve & send",
    body: "Review every line, then send with one tap. Nothing leaves without you.",
    Icon: SendIcon,
  },
];

/* ── Motion ───────────────────────────────────────────────── */
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      {/* Calm cream→stone radial wash + faint dot-grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #fffdf7 0%, #faf7ef 42%, #f4f0e6 100%)",
        }}
      />
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000_0%,transparent_75%)]"
      />
      {/* Soft clay glow, warm not cool */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 -z-10 h-80 w-80 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(234,154,133,0.35) 0%, transparent 70%)",
        }}
      />

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Wordmark />
        <p className="hidden text-sm text-stone-600 sm:block">
          <span className="text-forest-soft">See it.</span> Prove it. Act on it.
        </p>
        <a href="#start" className="btn-ghost hidden text-sm sm:inline-flex">
          Open a case
        </a>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-24 pt-12 text-center sm:px-8 sm:pt-20"
      >
        <motion.div
          variants={rise}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-paper/80 px-4 py-1.5 text-sm text-stone-600 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-clay" />
          A civic environmental agent
        </motion.div>

        <motion.h1
          variants={rise}
          className="max-w-4xl text-balance text-4xl leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          Report a civic environmental violation.{" "}
          <span className="italic text-forest-soft">Watch an agent act on it.</span>
        </motion.h1>

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
          <button className="btn-primary w-full sm:w-auto">
            Open a case
            <SendIcon />
          </button>
          <a href="#how" className="btn-ghost w-full sm:w-auto">
            See how it works
          </a>
        </motion.div>

        <motion.p
          variants={rise}
          className="mt-5 text-sm text-stone-600"
        >
          No account needed to start. You approve every action before it is sent.
        </motion.p>

        {/* ── How it works ──────────────────────────────── */}
        <motion.section
          variants={rise}
          id="how"
          className="mt-24 w-full scroll-mt-24 text-left"
        >
          <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl sm:text-3xl">How it works</h2>
            <p className="text-sm text-stone-600">
              Four calm steps from photo to filed complaint.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, title, body, Icon }) => (
              <div
                key={n}
                className="card group flex flex-col gap-4 p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_48px_-16px_rgba(20,83,45,0.18)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100 text-forest transition-colors duration-200 group-hover:bg-forest group-hover:text-cream">
                    <Icon />
                  </span>
                  <span className="text-xs font-medium tracking-widest text-stone-300">
                    {n}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-stone-300/70 px-6 py-8 text-sm text-stone-600 sm:flex-row sm:px-8">
        <Wordmark />
        <p>Built for cleaner streets, drains, and air.</p>
      </footer>
    </div>
  );
}

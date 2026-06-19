"use client";

import dynamic from "next/dynamic";
import { useMission } from "@/lib/useMission";
import { Capture } from "@/components/Capture";
import { MissionFeed } from "@/components/MissionFeed";
import { Clarify } from "@/components/Clarify";
import { ApproveGate } from "@/components/ApproveGate";
import { Result } from "@/components/Result";
import { Hero } from "@/components/Hero";
import { StickyNav } from "@/components/StickyNav";
import { FadeContent } from "@/components/reactbits/FadeContent";

// Leaflet must run client-only; this page is already a Client Component.
const ImpactMap = dynamic(
  () => import("@/components/ImpactMap").then((m) => m.ImpactMap),
  {
    ssr: false,
    loading: () => (
      <div className="card grid h-[376px] place-items-center text-sm text-stone-600">
        Loading impact map…
      </div>
    ),
  },
);

/* ── Brand mark ───────────────────────────────────────────── */
function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
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

/* ── Interactive case section ─────────────────────────────── */
function CaseSection() {
  const { steps, interrupt, done, running, start, resume } = useMission();
  const hasActivity = steps.length > 0 || running || !!interrupt || !!done;

  return (
    <section id="case" className="mt-28 w-full scroll-mt-24 text-left">
      <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl sm:text-3xl">Open a case</h2>
        <p className="text-sm text-stone-600">
          Watch the agent reason, then approve before anything is sent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: capture + gates + result */}
        <div className="flex flex-col gap-6">
          <Capture onStart={start} running={running} />

          {interrupt?.type === "clarify" && (
            <Clarify
              question={interrupt.question}
              onResume={resume}
              running={running}
            />
          )}
          {interrupt?.type === "approve" && (
            <ApproveGate
              artifacts={interrupt.artifacts}
              onResume={resume}
              running={running}
            />
          )}
          {done && <Result trackingId={done.tracking_id} />}
        </div>

        {/* Right: live feed + impact map */}
        <div className="flex flex-col gap-6">
          {hasActivity && <MissionFeed steps={steps} running={running} />}
          <ImpactMap />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div
      id="top"
      className="relative flex min-h-screen flex-1 flex-col overflow-hidden"
    >
      {/* Calm cream→stone radial wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #fffdf7 0%, #faf7ef 42%, #f4f0e6 100%)",
        }}
      />
      {/* Slow-drifting, very low-opacity stone/green dot-grid — alive but calm */}
      <div
        aria-hidden
        className="dot-grid-drift pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] opacity-70 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000_0%,transparent_78%)]"
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

      {/* ── Condensed sticky nav (appears on scroll) ────── */}
      <StickyNav />

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Wordmark />
        <p className="hidden text-sm text-stone-600 sm:block">
          <span className="text-forest-soft">See it.</span> Prove it. Act on it.
        </p>
        <a href="#case" className="btn-ghost hidden text-sm sm:inline-flex">
          Open a case
        </a>
      </header>

      {/* ── Hero + sections ─────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-28 pt-12 text-center sm:px-8 sm:pt-20">
        <Hero />

        {/* ── How it works ──────────────────────────────── */}
        <FadeContent id="how" className="mt-28 w-full scroll-mt-24 text-left">
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
        </FadeContent>

        {/* ── Interactive case flow ─────────────────────── */}
        <FadeContent className="w-full">
          <CaseSection />
        </FadeContent>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-stone-300/70 px-6 py-8 text-sm text-stone-600 sm:flex-row sm:px-8">
        <Wordmark />
        <p>Built for cleaner streets, drains, and air.</p>
      </footer>
    </div>
  );
}

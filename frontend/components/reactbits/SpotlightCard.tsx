"use client";

import { useRef, type ReactNode } from "react";

/**
 * React-Bits-style Spotlight Card: a warm radial glow tracks the cursor.
 * Forest-tinted, layered over the existing `.card` style.
 */
export function SpotlightCard({
  children,
  className = "",
  glow = "rgba(20,83,45,0.10)",
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--rb-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--rb-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={move}
      className={`rb-spotlight group/spot relative overflow-hidden ${className}`}
      style={{ "--rb-glow": glow } as React.CSSProperties}
    >
      <span className="rb-spotlight-layer" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

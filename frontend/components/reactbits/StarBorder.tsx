"use client";

import type { ReactNode } from "react";

/**
 * React-Bits-style Star Border: a soft travelling sheen around a pill.
 * Recolored to forest + terracotta. Subtle, professional, no WebGL.
 */
export function StarBorder({
  children,
  className = "",
  color = "rgba(234,122,95,0.9)",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={`rb-star-border relative inline-flex overflow-hidden rounded-[15px] p-[1.5px] ${className}`}
      style={{ "--rb-star": color } as React.CSSProperties}
    >
      <span className="rb-star-glow" aria-hidden />
      <span className="relative z-10 inline-flex w-full rounded-[13.5px]">
        {children}
      </span>
    </span>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * React-Bits-style Count Up. Animates a number from 0 to value.
 * Works with numeric values; falls back to plain text for non-numeric.
 */
export function CountUp({
  value,
  duration = 1100,
  className = "",
  prefix = "",
  suffix = "",
  plain = false,
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** When true, render raw digits without locale grouping (good for IDs). */
  plain?: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo for a satisfying settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {plain ? display : display.toLocaleString()}
      {suffix}
    </span>
  );
}

"use client";

import { useRef, useState, type ReactNode } from "react";

type Spark = { id: number; x: number; y: number };

/**
 * Lightweight React-Bits-style Click Spark.
 * Emits a burst of terracotta rays from the click point.
 * Palette-locked to SENTINEL (no blue/purple).
 */
export function ClickSpark({
  children,
  color = "#e07a5f",
  count = 8,
  radius = 22,
  className = "",
  onClick,
}: {
  children: ReactNode;
  color?: string;
  count?: number;
  radius?: number;
  className?: string;
  onClick?: () => void;
}) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);

  function burst(e: React.MouseEvent<HTMLSpanElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setSparks((s) => [
      ...s,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
    window.setTimeout(
      () => setSparks((s) => s.filter((sp) => sp.id !== id)),
      560,
    );
    onClick?.();
  }

  return (
    <span
      onClick={burst}
      className={`relative inline-flex isolate ${className}`}
    >
      {children}
      {sparks.map((sp) => (
        <span
          key={sp.id}
          aria-hidden
          className="pointer-events-none absolute z-10"
          style={{ left: sp.x, top: sp.y }}
        >
          {Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            return (
              <span
                key={i}
                className="rb-spark-ray"
                style={
                  {
                    background: color,
                    "--rb-tx": `${Math.cos(angle) * radius}px`,
                    "--rb-ty": `${Math.sin(angle) * radius}px`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      ))}
    </span>
  );
}

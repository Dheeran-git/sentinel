"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * React-Bits-style AnimatedContent / FadeContent: fades + rises a block into
 * view once, when it scrolls into the viewport (IntersectionObserver).
 * Reduced-motion users get the content with no transform/opacity animation.
 */
export function FadeContent({
  children,
  className = "",
  id,
  delay = 0,
  y = 18,
  threshold = 0.15,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  y?: number;
  threshold?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, threshold]);

  if (reduce) {
    return (
      <div ref={ref} id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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

/**
 * Condensed sticky top nav that fades + shrinks in once the hero scrolls past.
 * Soft cream/blur backdrop. Anchors smooth-scroll via the global scroll-behavior.
 */
export function StickyNav() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 280);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-0 z-50"
        >
          <div className="border-b border-stone-300/60 bg-cream/80 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 sm:px-8">
              <a href="#top" className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest text-cream">
                  <Leaf className="h-4 w-4" />
                </span>
                <span
                  className="text-base font-semibold tracking-tight text-forest"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  SENTINEL
                </span>
              </a>
              <a href="#case" className="btn-primary px-4 py-2 text-sm">
                Open a case
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

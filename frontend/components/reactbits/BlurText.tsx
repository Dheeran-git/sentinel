"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Fragment, type ReactNode } from "react";

/**
 * React-Bits-style BlurText / SplitText: reveals text word-by-word with a
 * soft blur-to-sharp settle. Palette-locked (inherits color, no blue/purple).
 * Children may include inline markup (e.g. an <span> emphasis) which is
 * revealed as a single unit.
 */
export function BlurText({
  text,
  className = "",
  delay = 0.18,
  stagger = 0.06,
  as: Tag = "h1",
}: {
  /** Words (strings) and/or inline nodes to reveal in order. */
  text: (string | ReactNode)[];
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay },
    },
  };

  const word: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {text.map((part, i) => (
        <Fragment key={i}>
          <motion.span variants={word} className="inline-block">
            {part}
          </motion.span>{" "}
        </Fragment>
      ))}
    </MotionTag>
  );
}

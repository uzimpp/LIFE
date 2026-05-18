"use client";

import { memo } from "react";
import {
  AnimatePresence,
  motion,
  type Variants,
} from "motion/react";

export const phrases = [
  "to think clearly",
  "to chart a path",
  "to weigh trade-offs",
  "to choose what's next",
  "to redesign work",
] as const;

const longestPhrase = phrases.reduce((a, b) => (a.length >= b.length ? a : b));

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
};

const wordVariants: Variants = {
  initial: { opacity: 0, y: 22 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
};

function AnimatedHeadlineComponent({ index }: { index: number }) {
  const words = phrases[index].split(" ");

  return (
    <h2 className="title-tight text-fg text-[3.5rem] leading-[1.02]">
      <span className="block">A private place</span>
      <span aria-live="polite" className="relative block">
        <span className="invisible block" aria-hidden>
          {longestPhrase}
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            key={index}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 block text-fg/75"
          >
            {words.map((word, wIdx) => (
              <motion.span
                key={`${index}-${wIdx}`}
                variants={wordVariants}
                className="mr-[0.28em] inline-block italic"
              >
                {word}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="block">about a life.</span>
    </h2>
  );
}

export const AnimatedHeadline = memo(AnimatedHeadlineComponent);

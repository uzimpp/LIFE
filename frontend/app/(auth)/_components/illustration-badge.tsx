"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Bulb,
  Compass,
  HangingScale,
  RedesignGrid,
  RoadSquiggle,
} from "./illustrations";

// Order must match `phrases` in card-content.tsx
const illustrations = [
  Bulb, // to think clearly
  RoadSquiggle, // to chart a path
  HangingScale, // to weigh trade-offs
  Compass, // to choose what's next
  RedesignGrid, // to redesign work
] as const;

export function IllustrationBadge({ index }: { index: number }) {
  const Icon = illustrations[index] ?? Bulb;
  return (
    <div className="relative h-14 w-14 text-fg/55" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Icon />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

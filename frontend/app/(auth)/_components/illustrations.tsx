"use client";

import { motion, useReducedMotion } from "motion/react";

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const svgClass = "h-full w-full";

// ─── 1. Bulb — "to think clearly" ──────────────────────────────
export function Bulb() {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 32 40" className={svgClass} {...stroke}>
      <motion.circle
        cx="16"
        cy="14"
        r="12"
        fill="currentColor"
        stroke="none"
        initial={{ opacity: 0.18 }}
        animate={reduced ? undefined : { opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />
      {/* dome + neck */}
      <path d="M16 4 C9.5 4 5 9 5 14.5 C5 18 6.8 20.8 9 22.6 L9 27 L23 27 L23 22.6 C25.2 20.8 27 18 27 14.5 C27 9 22.5 4 16 4 Z" />
      {/* base ridges */}
      <line x1="10" y1="30" x2="22" y2="30" />
      <line x1="11.5" y1="33" x2="20.5" y2="33" />
      <line x1="13" y1="36" x2="19" y2="36" />
      {/* filament */}
      <path d="M11.5 14 Q13 11.5 14.5 14 Q16 16.5 17.5 14 Q19 11.5 20.5 14" />
    </svg>
  );
}

// ─── 2. RoadSquiggle — "to chart a path" ───────────────────────
export function RoadSquiggle() {
  const reduced = useReducedMotion();
  const d = "M4 36 Q12 24 18 28 T32 16 T44 4";
  return (
    <svg viewBox="0 0 48 40" className={svgClass} {...stroke}>
      {/* base path - faint */}
      <path d={d} opacity={0.3} />
      {/* highlight segment traveling along the path */}
      <motion.path
        d={d}
        pathLength={1}
        strokeDasharray="0.18 0.82"
        initial={{ strokeDashoffset: 0 }}
        animate={reduced ? undefined : { strokeDashoffset: [0, -1] }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      />
    </svg>
  );
}

// ─── 3. HangingScale — "to weigh trade-offs" ───────────────────
export function HangingScale() {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 40 48" className={svgClass} {...stroke}>
      {/* hook */}
      <path d="M20 3 C17.5 3 17.5 7 20 7 C22.5 7 22.5 3 20 3" />
      {/* rope to pivot */}
      <line x1="20" y1="7" x2="20" y2="22" />
      {/* beam group — tilts ±3° */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
        animate={reduced ? undefined : { rotate: [-3, 3, -3] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      >
        <line x1="6" y1="22" x2="34" y2="22" />
        <line x1="9" y1="22" x2="9" y2="32" />
        <line x1="31" y1="22" x2="31" y2="32" />
        <ellipse cx="9" cy="35" rx="6.5" ry="2" />
        <ellipse cx="31" cy="35" rx="6.5" ry="2" />
      </motion.g>
    </svg>
  );
}

// ─── 4. Compass — "to choose what's next" ──────────────────────
export function Compass() {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 40 40" className={svgClass} {...stroke}>
      <circle cx="20" cy="20" r="16" />
      {/* North marker */}
      <circle cx="20" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      {/* tick marks */}
      <line x1="20" y1="34" x2="20" y2="32.5" />
      <line x1="6" y1="20" x2="7.5" y2="20" />
      <line x1="34" y1="20" x2="32.5" y2="20" />
      {/* needle — oscillates ±45° */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        animate={reduced ? undefined : { rotate: [-45, 45, -45] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      >
        <path
          d="M20 11 L23 20 L20 29 L17 20 Z"
          fill="currentColor"
          fillOpacity={0.25}
        />
        <line x1="20" y1="11" x2="20" y2="20" />
      </motion.g>
    </svg>
  );
}

// ─── 5. RedesignGrid — "to redesign work" ──────────────────────
export function RedesignGrid() {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 40 40" className={svgClass} {...stroke}>
      {/* fixed: top-left + bottom-right */}
      <rect x="6" y="6" width="11" height="11" rx="1.5" />
      <rect x="23" y="23" width="11" height="11" rx="1.5" />
      {/* animated: top-right → bottom-left round trip */}
      <motion.g
        animate={reduced ? undefined : { x: [0, -17, 0], y: [0, 17, 0] }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.5, 1],
        }}
      >
        <rect x="23" y="6" width="11" height="11" rx="1.5" />
      </motion.g>
      {/* animated: bottom-left → top-right round trip */}
      <motion.g
        animate={reduced ? undefined : { x: [0, 17, 0], y: [0, -17, 0] }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.5, 1],
        }}
      >
        <rect x="6" y="23" width="11" height="11" rx="1.5" />
      </motion.g>
    </svg>
  );
}

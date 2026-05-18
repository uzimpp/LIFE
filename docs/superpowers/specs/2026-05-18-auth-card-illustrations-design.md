# Auth Card — Per-Phrase Corner Illustrations

**Date:** 2026-05-18
**Surface:** `app/(auth)/layout.tsx` cream brand card

## Goal

Replace the time-passing hairline with a small per-phrase illustration in the bottom-right of the cream card. Each illustration has a slow looping micro-motion themed to the phrase it accompanies. The card already breathes at two layers (vignette pulse + headline word-stagger); this adds a third quiet layer in the corner.

## Constraints

- Animations are slow and non-distracting. Every loop runs ≥ 4s. Travel is ≤ ~6px / ≤ ±3°.
- `prefers-reduced-motion` disables all loops and the phrase interval; static frames remain.
- No new dependencies. Uses existing `motion/react` (Framer Motion).
- Hardware-accelerated only — `transform` and `opacity`, never `top/left/width/height`.

## Component split

```
app/(auth)/_components/
├── animated-headline.tsx    (MODIFIED — accepts index prop, no interval, no hairline)
├── card-content.tsx         (NEW — owns interval + reduced-motion, renders headline + badge)
├── illustration-badge.tsx   (NEW — AnimatePresence swap between illustrations)
└── illustrations.tsx        (NEW — exports Bulb, RoadSquiggle, HangingScale, Compass, RedesignGrid)
```

**State ownership:** `CardContent` is the single source of truth for the phrase index. The `setInterval` and `useReducedMotion` call live there. Both `AnimatedHeadline` and `IllustrationBadge` receive `index` (and `reduced` where needed) as props.

**Layout update:** `app/(auth)/layout.tsx` renders `<CardContent />` in place of the current `<AnimatedHeadline />`. The card's relative wrapper becomes `relative h-full w-full` so the badge can absolute-position to the corner.

## Badge styling

- Container: `h-14 w-14` (56px), no border/background — just the floating SVG
- Position: `absolute bottom-10 right-10` (matches `p-10`); `xl:bottom-14 xl:right-14` (matches `xl:p-14`)
- Color: `text-fg/55`; SVG uses `stroke="currentColor"` and `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`
- `pointer-events-none` so it never intercepts clicks

## Swap transition (when phrase index changes)

```ts
<AnimatePresence mode="wait">
  <motion.div
    key={index}
    initial={{ opacity: 0, scale: 0.88 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.88 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
  >
    <ActiveIllustration />
  </motion.div>
</AnimatePresence>
```

`mode="wait"` guarantees the outgoing illustration fully leaves before the new one mounts, so the new illustration's perpetual loop always starts from its first frame.

## Per-illustration spec

Each illustration is a standalone `function` exported from `illustrations.tsx`. All consume `useReducedMotion()` and guard their `animate` prop accordingly.

### 1. Bulb — "to think clearly"
- ViewBox `0 0 32 40`. Filament squiggle inside dome, line base.
- **Motion:** halo `<circle cx="16" cy="14" r="12" fill="currentColor" stroke="none">` opacity loops `[0.15, 0.4, 0.15]` over **4s ease-in-out**, infinite.

### 2. RoadSquiggle — "to chart a path"
- ViewBox `0 0 48 40`. Path `M4 36 Q12 24 18 28 T32 16 T44 4` (two soft S-curves).
- **Motion:** two stacked paths — a faint base path at opacity 0.3, and a highlight path that travels a short dash along the same geometry via `pathLength="1"` + `strokeDasharray="0.15 0.85"` + animated `strokeDashoffset: [0, -1]` over **6s linear**, infinite.

### 3. HangingScale — "to weigh trade-offs"
- ViewBox `0 0 40 48`. Hook → rope down to beam pivot at `(20, 22)` → beam group below.
- **Motion:** beam group `<motion.g>` rotates `[-3, 3, -3]` over **5s ease-in-out**, infinite. Hook + rope stay fixed. `style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}`.

### 4. Compass — "to choose what's next"
- ViewBox `0 0 40 40`. Outer circle, small dot at top for north, diamond needle centered.
- **Motion:** needle group rotates `[-45, 45, -45]` over **7s ease-in-out**, infinite. `transformOrigin` at compass center.

### 5. RedesignGrid — "to redesign work"
- ViewBox `0 0 40 40`. Four 10×10 rounded squares in a 2×2 arrangement.
- **Motion:** top-right and bottom-left squares oscillate their `translateX/Y` to swap positions and return. Each `<motion.g>` runs `x: [0, ±16, 0], y: [0, ∓16, 0]` over **5s ease-in-out**, infinite. Top-left and bottom-right stay fixed.

## Reduced motion

- `CardContent` checks `useReducedMotion()`; if true, the `setInterval` is not started (phrase stays on index 0).
- Each illustration also checks it and renders without an `animate` prop (or passes `{}`), so the static frame is shown.
- The crossfade `AnimatePresence` transition stays on — it's mild and only fires on phrase change.

## What gets removed

- The progress hairline block at the bottom of `AnimatedHeadline` (`<div className="mt-10 h-px ...">`).
- The `useEffect` interval and `useReducedMotion` call in `AnimatedHeadline` (moved up to `CardContent`).

## What stays

- The word-by-word stagger reveal of the rotating phrase.
- The invisible-sizer technique for stable slot height.
- The vignette breath in the layout's aside.
- All other auth surface (left form column, ChromeGate hiding nav/footer, palette pinning).

# LIFE — Design System Ruleset

> Living reference. This document captures the design system as currently implemented in the frontend.

---

## 1. Design Intent

Quiet, editorial, warm. The user opens this app feeling burnt out. Nothing on the page should add to the noise in their head.

- **Tone:** reflective, not motivational. No emojis. No exclamation marks.
- **Density:** generous whitespace, one decision per screen.
- **Motion:** GSAP for page orchestration, `motion` (Framer) for micro-interactions.
- **Material:** warm beige, paper-like feel. No pure white or pure black.

---

## 2. Color System

### Light Mode

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f2ead3` | Page background |
| `--surface` | `#fefcf6` | Cards, navbar, inputs |
| `--surface-deep` | `#d9ccaf` | Footer, footer sections |
| `--fg` | `#1a1814` | Primary text |
| `--muted` | `#6e6558` | Secondary text, labels |
| `--border` | `#bfb398` | Hairlines, dividers |
| `--sage-green` | `#315d34` | Data viz only (energy bars) |

### Dark Mode

| Token | Value | Use |
|---|---|---|
| `--bg` | `#141210` | Page background |
| `--surface` | `#211e1a` | Cards, navbar, inputs |
| `--surface-deep` | `#0d0b09` | Footer, sunken sections |
| `--fg` | `#f2ead3` | Primary text |
| `--muted` | `#8a7e6e` | Secondary text, labels |
| `--border` | `#342e27` | Hairlines, dividers |

**Rules:**
- No gradients.
- No drop shadows beyond `shadow-sm`.
- No pure white (`#ffffff`) or pure black (`#000000`) anywhere.

---

## 3. Typography

### Fonts

| Role | Font | Weight | Use |
|---|---|---|---|
| Display / `.title` | `Lora` (Google Fonts) | 400, 500, 600 | Headings `text-xl` and above |
| Body | `Host Grotesk` (Google Fonts) | 400+ | All other text |

### Type Scale

| Token | Value | Role |
|---|---|---|
| `--text-xs` | 11px | Eyebrow tags, labels |
| `--text-sm` | 14px | Captions, fine print |
| `--text-base` | 17px | Body copy |
| `--text-md` | 21px | Lead paragraphs |
| `--text-lg` | 28px | Subsection headings |
| `--text-xl` | 36px | Section headings |
| `--text-2xl` | 48px | Card headings |
| `--text-3xl` | 64px | Wizard questions |
| `--text-4xl` | 84px | Page titles (mobile) |
| `--text-5xl` | 110px | Page titles (desktop) |
| `--text-6xl` | 144px | Landing hero |
| `--text-7xl` | 188px | Editorial accent |
| `--text-8xl` | 248px | Decorative (max) |

### Utility Classes

```css
.title        /* Lora, 400, -0.03em, 0.96 line-height */
.title-tight  /* Lora, 400, -0.05em, 0.88 line-height, 2rem pb */
.text-display /* Lora, clamp(4.6rem → 16rem), -0.05em, 0.85 */
.text-headline/* Lora, clamp(1.9rem → 5.5rem), -0.05em */
.text-feature /* Lora, clamp(2.3rem → 10rem), -0.05em, 0.95 */
```

**Rules:**
- `text-xl` (36px) minimum for `.title`.
- Line height: `0.85–1.0` display, `1.6` body.
- Max line length: `60ch` body.

---

## 4. Layout

### Navbar (Floating Pill)

```
position: fixed top-4 left-0 right-0 z-40
rounded-full border border-border bg-surface/85 backdrop-blur-md
px-5 py-2.5 → scrolled: px-4 py-2 + shadow-sm
```

- Logo: `.title text-lg` left-aligned
- Desktop: nav links (auth-gated) → avatar or Sign In button
- Mobile: hamburger → full-screen overlay with staggered reveal

### Footer

```
bg-surface-deep py-12 px-6 md:px-12
```

- Row 1: LIFE wordmark | Info link
- Row 2: © 2026

### Page Widths

| Context | Width | Padding |
|---|---|---|
| Prose / Wizard | `max-w-2xl mx-auto` | `px-6` |
| Dashboard / Info | `max-w-5xl mx-auto` | `px-6` |
| Landing | `max-w-7xl mx-auto` | `px-6 md:px-12` |

- Page padding: `pt-24` (clear fixed navbar)
- Body: `min-h-[100dvh]` (not `h-screen`)

### Responsive

| Breakpoint | Behavior |
|---|---|
| `< 768px` | Single column, `px-4`, hamburger |
| `≥ 768px` | Full nav, `px-6` |
| `≥ 1280px` | `max-w-5xl` caps content |

---

## 5. Components

### Buttons

```css
/* Primary */
rounded-full bg-fg text-bg px-8 py-3 text-sm font-medium
hover:opacity-75 transition-opacity

/* Secondary */
rounded-full border border-border px-4 py-1.5 text-xs font-medium
hover:bg-surface-deep transition-colors

/* Ghost */
text-sm text-muted hover:text-fg transition-colors
```

**Always include:** `cursor-pointer` + `focus-visible:ring-2`

### Cards

```
rounded-[2rem] border border-border bg-surface p-6
```

### Eyebrow Tag

```
text-[10px] uppercase tracking-[0.32em] font-medium
bg-surface-deep text-muted
```

### Form Inputs

```
rounded-lg border border-border bg-surface px-4 py-2
focus:border-fg focus:ring-1 focus:ring-fg
```

---

## 6. Routes

| Route | Auth | Notes |
|---|---|---|
| `/` | Public | Landing — hero + features + methodology teaser |
| `/login` | Public | Google sign-in |
| `/info` | Public | Intention, source (MethodologyTeaser), about (letter) |
| `/me` | Protected | Dashboard |
| `/onboarding` | Protected | Life snapshot wizard |
| `/odyssey` | Protected | Odyssey planning wizard |
| `/energy` | Protected | Energy log + chart |

---

## 7. Motion

### Libraries

- **`gsap`** — page orchestration, ScrollTrigger, wizard step timelines
- **`motion`** (Framer) — component micro-interactions, hover, tap, spring

### Rules

- Animate `transform` and `opacity` only. Never layout properties.
- Entry animation: `opacity: 0, y: 26` → `opacity: 1, y: 0` over 950ms, `ease: power3.out`
- Stagger: 0.04s per word for per-word reveals
- `prefers-reduced-motion`: instant transitions (no animation)

---

## 8. Accessibility

- WCAG AA contrast on all text
- Focus states: `focus-visible:ring-2 ring-fg ring-offset-2`
- Form labels always present
- Hit targets: minimum 44×44 on touch
- No icon-only buttons without `aria-label`

---

## 9. Don'ts

- ❌ No pure white or pure black surfaces
- ❌ No gradients
- ❌ No `h-screen` — use `min-h-[100dvh]`
- ❌ No motion loops without user input
- ❌ No Lora below `text-xl`
- ❌ No `text-muted-foreground` — use explicit `text-muted`
- ❌ No backdrop-blur on scrolling containers
# LIFE — UX/UI Plan 2 Design Spec

Date: 2026-05-16  
Status: Approved

---

## 1. Overview

A full design-system-first redesign of the LIFE frontend. The goal is a coherent, editorial product with a warm beige material identity, Major Third typography, persistent navbar/footer, a new public `/info` page, and a route rename from `/dashboard` to `/me`.

Approach: define design tokens and shared components first, then rebuild all pages against that system.

---

## 2. Color System

Replace the pure zinc-50/white base with a warm beige family. No pure white, no pure black anywhere on any surface.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F5F0E8` | Page background |
| `--surface` | `#FAF7F2` | Cards, navbar, inputs |
| `--surface-deep` | `#EDE8DF` | Footer, sunken sections, alternating rows |
| `--fg` | `#1C1C1A` | Primary text |
| `--muted` | `#6B6860` | Secondary text, labels, placeholders |
| `--border` | `#DDD8CF` | Hairlines, dividers, input borders |
| Dark `--bg` | `#141210` | Warm near-black page background |
| Dark `--surface` | `#1E1B18` | Warm dark card surface |
| Dark `--fg` | `#F5F0E8` | Primary text on dark |
| Dark `--muted` | `#8A857D` | Secondary text on dark |
| Dark `--border` | `#2E2A25` | Hairlines on dark |

**Accent:** `#85c165` (sage green) is reserved for data visualisation only — positive energy delta bars in charts. It is not used as a UI interactive color.

**Rules:**
- No gradients anywhere.
- No drop shadows beyond `shadow-sm` on elevated surfaces (popovers, dialogs).
- Buttons, inputs, cards all use `--surface` or `--surface-deep` — never raw white.

---

## 3. Typography

### Fonts (unchanged)
- **Display:** `Libre Caslon Display` — all headings at `xl` (31px) and above
- **Body:** `Host Grotesk` — everything else

### Major Third Scale (ratio 1.25)

| Step | rem | px | Role | Family |
|---|---|---|---|---|
| `--text-xs` | 0.64rem | ~10px | Eyebrow tags, uppercase labels | Host Grotesk |
| `--text-sm` | 0.8rem | ~13px | Captions, metadata, timestamps | Host Grotesk |
| `--text-base` | 1rem | 16px | Body copy | Host Grotesk |
| `--text-md` | 1.25rem | 20px | Lead paragraphs, card intros | Host Grotesk |
| `--text-lg` | 1.563rem | 25px | Subsection headings | Host Grotesk medium |
| `--text-xl` | 1.953rem | 31px | Section headings | Libre Caslon Display |
| `--text-2xl` | 2.441rem | 39px | Page titles | Libre Caslon Display |
| `--text-3xl` | 3.052rem | 49px | Hero headings (tablet) | Libre Caslon Display |
| `--text-4xl` | 3.815rem | 61px | Hero headings (desktop) | Libre Caslon Display |
| `--text-5xl` | 4.768rem | 76px | Landing hero only | Libre Caslon Display |

**Rules:**
- Libre Caslon Display only at `xl` (31px) and above. Apply via `.title` class.
- `letter-spacing: -0.02em` on Caslon at `3xl` and above.
- Line height: `1.1` for display sizes, `1.6` for body, `1.4` for leads.
- Max line length: `60ch` body prose, `40ch` hero headlines.

### Tailwind config
Define the scale as custom `fontSize` values in `tailwind.config.ts` so classes like `text-md`, `text-lg` etc. map to the Major Third steps above. This replaces Tailwind's default arbitrary scale for this project.

---

## 4. Routes

| Route | File | Auth | Change |
|---|---|---|---|
| `/` | `app/page.tsx` | Public | Redesign |
| `/login` | `app/login/page.tsx` | Public | Redesign |
| `/info` | `app/info/page.tsx` | Public | **New** |
| `/me` | `app/(app)/me/page.tsx` | Protected | **Renamed from `/dashboard`** |
| `/onboarding` | `app/(app)/onboarding/page.tsx` | Protected | Redesign |
| `/odyssey` | `app/(app)/odyssey/page.tsx` | Protected | Redesign |
| `/energy` | `app/(app)/energy/page.tsx` | Protected | Redesign |

**Backend change required:** `internal/controller/http/v1/handler/auth.go` OAuth callback redirect target changes from `cfg.HTTP.Host + "/dashboard"` to `cfg.HTTP.Host + "/me"`.

**Frontend changes required:** All `href="/dashboard"` references updated to `/me`. Directory `app/(app)/dashboard/` renamed to `app/(app)/me/`.

**Intended first-time user flow:**
```
/ → /login → /onboarding → /odyssey → /energy → /me
```

---

## 5. Layout System

### Navbar

Floating pill, detached from top. Not a full-width sticky bar.

```
position: fixed; top: 1rem; left: 0; right: 0; z-index: 40;
width: fit-content; margin: 0 auto;
background: #FAF7F2 at 80% opacity; backdrop-filter: blur(12px);
border: 1px solid #DDD8CF; border-radius: 9999px;
padding: 0.75rem 1.5rem;
```

Contents left → right:
- `LIFE` wordmark in Libre Caslon, links to `/`
- Flex gap
- Nav links (auth-gated): `Onboarding · Odyssey · Energy · Me`
- `Sign in` pill button (unauthenticated) or user avatar circle (authenticated, shows initials)

Mobile: wordmark left, hamburger right. Full-screen overlay on open, nav links stagger in from `translate-y-4 opacity-0`.

### Footer

```
background: #EDE8DF (--surface-deep)
padding: py-12 px-6 md:px-12
```

Two rows:
- Row 1: `LIFE` wordmark left — `Info` link right
- Row 2: `© 2026` left — optional GitHub link right

### Page wrapper (all pages)

```
<body bg-[--bg]>
  <Navbar />           {/* fixed, z-40 */}
  <main pt-24>         {/* clears navbar */}
    <div class="max-w-2xl mx-auto px-6">   {/* prose / wizard pages */}
    <div class="max-w-5xl mx-auto px-6">   {/* dashboard / info pages */}
  </main>
  <Footer />
</body>
```

### Responsive rules

| Breakpoint | Behaviour |
|---|---|
| `< 768px` | Single column, `px-4`, hamburger nav |
| `768px–1280px` | Full nav, `px-8`, standard layout |
| `1280px–1920px` | `max-w-5xl` caps content, margins grow |
| `> 1920px` | Content stays `max-w-5xl`, side margins absorb space |

Never use `h-screen` for full-height sections — use `min-h-[100dvh]` to prevent iOS Safari viewport jumping.

---

## 6. Shared Components

All of the following are new or updated shared components. They consume the token set above and are used across pages.

### `<Navbar>`
- Client component (needs auth state)
- Reads session from a shared `useUser()` hook or server-prop passed from layout
- Hamburger morphs to × via `rotate-45` / `-rotate-45` on two absolute-positioned lines

### `<Footer>`
- Server component (static)
- `--surface-deep` background
- Links: Info (left), GitHub (right, optional)

### `<PageShell>`
- Wraps `<main>` with correct `pt-24`, accepts `width` prop: `"prose"` (max-w-2xl) or `"wide"` (max-w-5xl)

### Button variants
- Primary: `rounded-full bg-[--fg] text-[--bg] px-8 py-3 text-sm font-medium` — uses warm near-black, not pure black
- Secondary: `rounded-full border border-[--border] px-8 py-3 text-sm`
- Ghost: `text-sm text-[--muted] hover:text-[--fg] transition-colors`

### Card shell (Double-Bezel)
- Outer: `rounded-[2rem] border border-[--border] bg-[--surface] p-1.5`
- Inner: `rounded-[calc(2rem-0.375rem)] bg-[--surface] px-6 py-5`

---

## 7. Pages

### `/` — Landing

Sections in order:

1. **Hero** — Full viewport height. Large Caslon title (`text-4xl md:text-5xl`): `"Map your life. Plan three futures. Learn what gives you energy."` Subtitle in Host Grotesk `text-md text-[--muted]`. Single CTA: `Get started →` primary button linking to `/login`. Background `--bg`.

2. **Feature highlights** — Three cards in a bento-style grid (`md:grid-cols-3`). Each card: eyebrow label (`ONBOARDING / ODYSSEY / ENERGY`), one-line title, two-sentence description. Cards use the Double-Bezel shell. Background `--surface-deep`.

3. **Info teaser** — A single editorial row: `"Built on Designing Your Life"` heading (Caslon `text-xl`), one paragraph crediting Burnett & Evans, a ghost link `Read more →` to `/info`. Background `--bg`.

4. **Footer**

### `/login` — Login

Centered layout, `max-w-sm mx-auto`. `--bg` background.

- Caslon heading: `"Welcome back."`
- Subtitle: `"Sign in to continue."`
- Google sign-in button (primary variant, full width)
- Ghost link to `/info` below the button: `"What is this?"`

### `/info` — Info (public)

`max-w-3xl` wide. Four sections, separated by `--border` hairlines.

1. **The intention** — Why this app exists. Personal motivation. Tone: honest, not promotional.
2. **Book reference** — Credit to *Designing Your Life* by Bill Burnett & Dave Evans. Brief description of Odyssey Planning as the source method.
3. **How to use it** — Four steps: Start with Onboarding → Map Odyssey paths → Log Energy → Read your dashboard. Each step is one short paragraph.
4. **Who built it** — Short author bio, contact link or GitHub.

Page is public, no auth required. Linked from footer and landing page teaser.

### `/me` — Dashboard (was `/dashboard`)

`max-w-5xl` wide. Content unchanged from current implementation, but:
- Wrapped in `<PageShell width="wide">`
- Navbar and footer present
- Colors updated to token system
- `href="/dashboard"` references updated to `/me`

### `/onboarding`, `/odyssey`, `/energy`

`max-w-2xl` wide. Content/logic unchanged from current implementation. Each:
- Wrapped in `<PageShell width="prose">`
- Navbar and footer present
- Colors updated to token system

---

## 8. Motion

Unchanged from existing spec. Summary:
- `motion` (Framer) for component-level micro-interactions
- `gsap` for page-level orchestration and wizard step transitions
- All animations on `transform` and `opacity` only — never layout properties
- `prefers-reduced-motion`: instant transitions when set
- Entry animations: `translate-y-4 opacity-0` → `translate-y-0 opacity-1` over 600ms

---

## 9. Implementation Order

1. Design tokens — `tailwind.config.ts`, `globals.css` CSS variables
2. Shared components — `<Navbar>`, `<Footer>`, `<PageShell>`, updated button/card variants
3. Backend route fix — OAuth callback redirect `/dashboard` → `/me`
4. Route rename — `app/(app)/dashboard/` → `app/(app)/me/`, update all refs
5. New page — `app/info/page.tsx`
6. Rebuild `/` landing page
7. Rebuild `/login` page
8. Apply token system to existing wizard pages (onboarding, odyssey, energy)
9. Apply token system to `/me` dashboard

---

## 10. Out of Scope

- No new backend endpoints
- No changes to wizard logic or form behaviour
- No dark mode redesign (tokens defined but dark mode implementation is existing)
- No new animations beyond what existing pages already use

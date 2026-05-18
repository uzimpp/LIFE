import Link from "next/link";

// Editorial micro-groups. Kept small on purpose — the site is small.
// Each group's eyebrow uses the same tracking and casing as the rest of
// the marketing surface so the footer reads as part of the same essay.
const EXPLORE = [
  { label: "Life Snapshot", href: "/onboarding" },
  { label: "Odyssey Planning", href: "/odyssey" },
  { label: "Energy Mapping", href: "/energy" },
];

const SOURCE = [
  { label: "Read about the method", href: "/info" },
  { label: "Begin a session", href: "/login" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-surface-deep border-t border-border overflow-hidden">
      {/* ── Top eyebrow — matches the home hero's "What this is" rule ── */}
      <div className="px-6 md:px-12 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto flex items-center gap-5">
          <span aria-hidden className="h-px w-12 bg-border" />
          <span className="text-xs uppercase tracking-[0.32em] font-medium text-muted">
            Continue, when you are ready
          </span>
        </div>
      </div>

      {/* ── Main: sculptural wordmark on the left, inscriptions on the right ── */}
      <div className="px-6 md:px-12 pt-12 md:pt-16 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-14 md:gap-x-10 items-end">
          {/* Sculptural wordmark — treated like a monument, not a logo */}
          <div className="md:col-span-7 flex flex-col gap-8">
            <Link
              href="/"
              aria-label="LIFE — return to the start"
              className="group inline-flex w-fit"
            >
              <span
                className="title-tight text-fg leading-[0.85] transition-colors duration-500 group-hover:text-fg/80"
                style={{
                  fontSize: "clamp(5rem, 16vw, 13rem)",
                  letterSpacing: "-0.06em",
                  paddingBottom: 0,
                }}
              >
                LIFE
              </span>
            </Link>

            <p className="title text-fg/90 text-2xl md:text-[1.75rem] leading-[1.15] max-w-md">
              A quiet workspace for the{" "}
              <em className="text-fg/70">in&#8209;between.</em>
            </p>
          </div>

          {/* Inscriptions — two small columns, eyebrow + linkstack each */}
          <div className="md:col-span-5 md:col-start-8 grid grid-cols-2 gap-x-8 gap-y-10">
            <div className="flex flex-col gap-5">
              <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
                The method
              </span>
              <ul className="flex flex-col gap-3">
                {EXPLORE.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-baseline gap-2 text-sm text-fg/85 hover:text-fg transition-colors"
                    >
                      <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-5">
              <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
                Elsewhere
              </span>
              <ul className="flex flex-col gap-3">
                {SOURCE.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-baseline gap-2 text-sm text-fg/85 hover:text-fg transition-colors"
                    >
                      <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Closing inscription row — three quiet marks separated by rules ── */}
      <div className="px-6 md:px-12 pb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-t border-border pt-6">
          <span className="text-xs text-muted tabular-nums">
            &copy; {year} LIFE
          </span>
          <span aria-hidden className="hidden md:block h-px flex-1 bg-border" />
          <span className="text-xs italic text-muted">
            Three sketches. Begin yours.
          </span>
          <span aria-hidden className="hidden md:block h-px flex-1 bg-border" />
          <span className="text-xs text-muted">
            Based on Designing Your Life &mdash; Burnett &amp; Evans
          </span>
        </div>
      </div>
    </footer>
  );
}

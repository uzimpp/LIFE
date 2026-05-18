"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import SlideUpText from "@/components/SlideUpText";

// ─── The "0" — a closed loop. The shape of walking the same route twice.
// Slowly rotates with a single mark on its perimeter, like a clock hand
// or a hiker still tracing the same circle.
function LoopZero() {
  return (
    <span
      className="relative inline-block align-baseline"
      style={{ lineHeight: "inherit" }}
    >
      <span
        aria-hidden
        className="invisible inline-block"
        style={{ lineHeight: "inherit" }}
      >
        0
      </span>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 m-auto h-[0.78em] w-[0.78em] -translate-y-[0.06em] motion-safe:animate-[spin_28s_linear_infinite] text-fg"
        style={{ transformOrigin: "50% 50%" }}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
        />
        <circle cx="50" cy="8" r="3.6" fill="currentColor" />
      </svg>
    </span>
  );
}

// ─── Three reflective doorways back into the method ──────────────────────────
const DOORWAYS = [
  {
    eyebrow: "Calibration",
    title: "Life Snapshot",
    body: "Rate eight areas. Pick a few tags. Name three goals. Ten minutes to mark where you actually stand.",
    href: "/onboarding",
  },
  {
    eyebrow: "Imagination",
    title: "Odyssey Planning",
    body: "Write three five-year paths — the one you're on, an alternate, and a radically different one. Score each on likeability, confidence, and excitement.",
    href: "/odyssey",
  },
  {
    eyebrow: "Observation",
    title: "Energy Mapping",
    body: "Log activities. Rate the energy before and after. After a week or two, the patterns surface on their own.",
    href: "/energy",
  },
];

// ─── A wandering trail across the hero. Same visual vocabulary as the
// methodLine on the home page, but drifting off-frame at both ends with a
// single marker placed at the user's divergence point.
function WanderingTrail({
  pathRef,
  markerRef,
}: {
  pathRef: React.RefObject<SVGPathElement | null>;
  markerRef: React.RefObject<SVGCircleElement | null>;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1400 900"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full pointer-events-none"
    >
      <path
        ref={pathRef}
        d="M -40 740 C 220 660, 360 540, 540 588 S 940 760, 1180 460 S 1420 220, 1640 260"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-border"
      />
      <circle
        ref={markerRef}
        cx="540"
        cy="588"
        r="4"
        className="fill-fg opacity-0"
      />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function NotFound() {
  const heroRef = useRef<HTMLElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const markerRef = useRef<SVGCircleElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // The three digits drop in like falling type, each from its own
      // overflow-hidden clip box. Same per-char pattern as LifeWord, but
      // staggered so the "0" lands last — earning its rotation.
      const digits = numbersRef.current?.querySelectorAll<HTMLElement>(
        ".digit-char",
      );
      if (digits) {
        gsap.set(digits, { yPercent: 120 });
        gsap.to(digits, {
          yPercent: 0,
          duration: 0.95,
          ease: "power4.out",
          stagger: 0.13,
          delay: 0.25,
        });
      }

      // Headline chars — SlideUpText render-time opacity:0, so claim them
      // first via gsap.set and then lift them up. Identical timing language
      // to the home hero so the two pages feel cut from the same cloth.
      const chars =
        heroRef.current!.querySelectorAll<HTMLElement>(".slide-up-char");
      gsap.set(chars, { yPercent: 140, opacity: 1 });
      gsap.to(chars, {
        yPercent: 0,
        duration: 0.85,
        ease: "power4.out",
        stagger: 0.035,
        delay: 0.55,
      });

      // The wandering trail draws itself across the screen — same
      // strokeDashoffset trick used by methodLine on the home page.
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        pathRef.current.style.strokeDasharray = `${len}`;
        pathRef.current.style.strokeDashoffset = `${len}`;
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 2.6,
          delay: 0.45,
          ease: "power2.inOut",
        });
      }

      // Divergence marker fades in once the trail has reached it — the
      // moment the page acknowledges "you are here".
      if (markerRef.current) {
        gsap.to(markerRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: 1.6,
        });
      }

      // Eyebrow / subtitle / CTA / footer line — same fade-and-rise
      // language used throughout the marketing surface.
      gsap.fromTo(
        [
          eyebrowRef.current,
          subtitleRef.current,
          ctaRef.current,
          footerLineRef.current,
        ],
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.14,
          delay: 1.55,
        },
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="overflow-x-hidden w-full">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col px-6 md:px-12 pt-24 md:pt-28 pb-28"
      >
        <WanderingTrail pathRef={pathRef} markerRef={markerRef} />

        <div className="relative max-w-7xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-10 items-center">
          {/* ── Left: eyebrow + headline + subtitle + CTAs ──────────────── */}
          <div className="md:col-span-6 md:col-start-1 flex flex-col gap-10">
            <div
              ref={eyebrowRef}
              className="flex items-center gap-5 opacity-0"
            >
              <span aria-hidden className="h-px w-12 bg-border" />
              <span className="text-xs uppercase tracking-[0.32em] font-medium text-muted">
                Error 404 — Off the route
              </span>
            </div>

            <h1 className="title-tight text-fg text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[0.94]">
              <SlideUpText text="You stepped" />
              <br />
              <SlideUpText
                text="off the route."
                italic
                className="text-fg/85"
              />
            </h1>

            <p
              ref={subtitleRef}
              className="text-md leading-8 text-muted max-w-md opacity-0"
            >
              The page you were looking for is unmarked — or no longer is.
              That is fine. Most of the useful turns in a life happen
              somewhere off the map.
            </p>

            <div
              ref={ctaRef}
              className="flex flex-wrap items-center gap-x-8 gap-y-4 opacity-0"
            >
              <Link
                href="/"
                aria-label="Return to the start of the site"
                className="group inline-flex items-center gap-3 rounded-full bg-fg text-bg px-8 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
              >
                Return to the start
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bg/10 transition-transform duration-500 group-hover:-rotate-[35deg]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
              <Link
                href="/info"
                className="text-sm font-medium text-muted hover:text-fg transition-colors"
              >
                Read about the method
              </Link>
            </div>
          </div>

          {/* ── Right: editorial 404 with the looping zero ──────────────── */}
          <div
            ref={numbersRef}
            aria-label="404"
            className="md:col-span-6 md:col-start-7 flex items-end justify-end leading-none select-none"
          >
            <div
              className="title-tight text-fg inline-flex items-baseline"
              style={{
                fontSize: "clamp(8rem, 22vw, 19rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.06em",
              }}
            >
              <span
                className="overflow-hidden inline-block align-baseline"
                style={{
                  lineHeight: "inherit",
                  paddingTop: "0.18em",
                  marginTop: "-0.18em",
                  paddingBottom: "0.06em",
                  marginBottom: "-0.06em",
                }}
              >
                <span
                  className="digit-char inline-block tabular-nums"
                  style={{ lineHeight: "inherit", willChange: "transform" }}
                >
                  4
                </span>
              </span>
              <span
                className="overflow-hidden inline-block align-baseline"
                style={{
                  lineHeight: "inherit",
                  paddingTop: "0.18em",
                  marginTop: "-0.18em",
                  paddingBottom: "0.06em",
                  marginBottom: "-0.06em",
                }}
              >
                <span
                  className="digit-char inline-block tabular-nums"
                  style={{ lineHeight: "inherit", willChange: "transform" }}
                >
                  <LoopZero />
                </span>
              </span>
              <span
                className="overflow-hidden inline-block align-baseline"
                style={{
                  lineHeight: "inherit",
                  paddingTop: "0.18em",
                  marginTop: "-0.18em",
                  paddingBottom: "0.06em",
                  marginBottom: "-0.06em",
                }}
              >
                <span
                  className="digit-char inline-block tabular-nums"
                  style={{ lineHeight: "inherit", willChange: "transform" }}
                >
                  4
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom contemplation line — matches the home hero pattern ─── */}
        <div
          ref={footerLineRef}
          className="absolute bottom-12 inset-x-6 md:inset-x-12 opacity-0"
        >
          <div className="max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-6 border-t border-border pt-6">
              <span className="text-xs text-muted">
                A wrong turn is still data.
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">
                Continue, when you are ready.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MethodologyTeaser from "@/components/MethodologyTeaser";
import SlideUpText from "@/components/SlideUpText";

gsap.registerPlugin(ScrollTrigger);

// ─── Life word — each char gets its own overflow-hidden wrapper for the
// yPercent slide animation (entry, and the i/f/e → I/F/E flip).
function LifeWord() {
  const TRANSFORM_CHARS = ["i", "f", "e"] as const;

  return (
    <span className="inline-flex text-display text-fg" aria-label="Life">
      <span
        className="overflow-hidden inline-block"
        style={{ lineHeight: "inherit" }}
      >
        <span
          className="gsap-char inline-block"
          style={{ lineHeight: "inherit" }}
        >
          L
        </span>
      </span>

      {TRANSFORM_CHARS.map((char) => (
        <span
          key={char}
          className="overflow-hidden inline-block"
          style={{ lineHeight: "inherit" }}
        >
          <span
            className="gsap-char inline-block"
            style={{ lineHeight: "inherit" }}
          >
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── Marquee strip ────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Life Snapshot",
  "Odyssey Planning",
  "Energy Mapping",
  "Three Futures",
  "Self-Knowledge",
  "Designing Your Life",
  "What Gives You Energy",
  "Burnett & Evans",
  "Five-Year Plans",
  "Honest Reflection",
];

function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-border py-4 bg-surface-deep">
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-6">
            <span
              className={
                i % 3 === 0
                  ? "title text-md text-fg italic"
                  : "text-xs uppercase tracking-[0.25em] font-medium text-muted"
              }
            >
              {item}
            </span>
            <span className="text-border text-xs">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── About the project — per-word slide-up + opacity scrub on scroll ────────

const ABOUT_PARAGRAPH =
  "This is a quiet workspace for the in-between — not a coach, not a planner, not another productivity tool. It is a method for the version of you that has stopped asking what comes next and started asking why. Three small exercises, taken slowly, return that question to its proper size.";

function AboutProject() {
  const ref = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const words = ref.current!.querySelectorAll<HTMLElement>(".reveal-word");

      // Scrub-driven rise + bloom. Using a scrubbed timeline with fromTo
      // (instead of gsap.set + gsap.to) keeps the from/to values bound to
      // the tween itself, so they survive ScrollTrigger.refresh() and the
      // strict-mode double-invoke cleanup cycle without losing state.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 0.8,
          },
        })
        .fromTo(
          words,
          { yPercent: 110, opacity: 0.12 },
          {
            yPercent: 0,
            opacity: 1,
            ease: "power2.out",
            stagger: 0.06,
          },
        );

      if (eyebrowRef.current) {
        gsap.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 82%",
              once: true,
            },
          },
        );
      }
    }, ref);

    return () => ctx.revert();
  }, []);

  const words = ABOUT_PARAGRAPH.split(" ");

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-32 md:py-48 border-t border-border"
    >
      <div className="max-w-5xl mx-auto">
        <div
          ref={eyebrowRef}
          className="mb-12 md:mb-16 flex items-center gap-5 opacity-0"
        >
          <span aria-hidden className="h-px w-12 bg-border" />
          <span className="text-xs uppercase tracking-[0.32em] font-medium text-muted">
            What this is
          </span>
        </div>

        <p
          className="title text-fg"
          style={{
            fontSize: "clamp(1.85rem, 4vw, 3.25rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
          }}
          aria-label={ABOUT_PARAGRAPH}
        >
          {words.map((word, i) => (
            <span key={i}>
              <span
                className="overflow-hidden inline-block align-baseline"
                style={{
                  lineHeight: "inherit",
                  // Extend the clip-box above/below so serif ascenders and
                  // descenders aren't truncated mid-tween. Matching negative
                  // margins preserve surrounding layout.
                  paddingTop: "0.3em",
                  marginTop: "-0.3em",
                  paddingBottom: "0.25em",
                  marginBottom: "-0.25em",
                }}
              >
                <span
                  className="reveal-word inline-block"
                  style={{ lineHeight: "inherit", willChange: "transform" }}
                >
                  {word}
                </span>
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

// ─── Method movements — editorial plaques, alternating zig-zag w/ drawn line

const METHOD_STEPS = [
  {
    step: "01",
    tag: "Calibration",
    title: "Start with Onboarding",
    body: "Rate eight areas of your life, pick tags that reflect your interests, and name your top three goals. A ten-minute snapshot of where you are right now.",
  },
  {
    step: "02",
    tag: "Imagination",
    title: "Map your Odyssey paths",
    body: "Write three five-year scenarios: the path you're on, an alternate path, and a radically different one. Rate each on likeability, confidence, and excitement. The gaps between scores are usually more informative than the scores themselves.",
  },
  {
    step: "03",
    tag: "Observation",
    title: "Log your energy",
    body: "Over days or weeks, log activities and rate your energy before and after. Patterns emerge. The goal is not to eliminate low-energy activities — it's to know which ones drain you more than you expect.",
  },
];

function MethodMovements() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".method-plaque").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });

      const path =
        sectionRef.current?.querySelector<SVGPathElement>("#methodLine");
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <svg
          aria-hidden
          viewBox="0 0 1000 900"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-[22rem] bottom-12 w-full h-[calc(100%-26rem)] pointer-events-none hidden md:block"
        >
          <path
            id="methodLine"
            d="M 180 0 C 360 180, 700 200, 820 360 S 280 600, 200 900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        </svg>

        <ol className="relative grid grid-cols-1 md:grid-cols-12 gap-y-16">
          {METHOD_STEPS.map(({ step, title, body, tag }, i) => {
            const isLeft = i % 2 === 0;
            return (
              <li
                key={step}
                className={`method-plaque md:col-span-7 ${
                  isLeft ? "md:col-start-1" : "md:col-start-6"
                }`}
              >
                <div
                  className={`flex flex-col gap-6 ${
                    isLeft ? "md:pr-12" : "md:pl-12 md:items-end md:text-right"
                  }`}
                >
                  <div className="flex items-baseline gap-5">
                    <span className="title-tight text-fg text-6xl md:text-7xl tabular-nums leading-none">
                      {step}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
                      {tag}
                    </span>
                  </div>
                  <h3 className="title text-fg text-2xl md:text-3xl leading-tight max-w-md">
                    {title}
                  </h3>
                  <p className="text-base leading-7 text-muted max-w-md">
                    {body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────

function FinalCTA() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const chars =
        ref.current!.querySelectorAll<HTMLElement>(".slide-up-char");

      gsap.set(chars, { yPercent: 140, opacity: 1 });

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            once: true,
            onEnter: () => {
              gsap.to(chars, {
                yPercent: 0,
                duration: 0.85,
                ease: "power4.out",
                stagger: 0.025,
                delay: 0.1,
              });
            },
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 py-32 md:py-48 border-t border-border"
    >
      <div className="max-w-5xl mx-auto text-center space-y-10 md:space-y-12">
        <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
          <span aria-hidden className="h-px w-12 bg-border" />
          <span>One last thing</span>
          <span aria-hidden className="h-px w-12 bg-border" />
        </div>

        <h2 className="title-tight text-fg text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.94]">
          <SlideUpText text="Three sketches." />
          <br />
          <SlideUpText text="Begin yours." italic className="text-fg/80" />
        </h2>

        <p className="text-base md:text-md text-muted max-w-xl mx-auto leading-8">
          Ten minutes. Three paths. The next clear thought is closer than you
          might think.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-2">
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 rounded-full bg-fg text-bg px-8 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
          >
            Begin a session
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bg/10 transition-transform duration-500 group-hover:rotate-[-35deg]">
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
            className="text-sm text-muted hover:text-fg transition-colors"
          >
            Read about the method
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const lifeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lifeRef.current) return;

    // gsap.context tracks every tween/set created inside the callback. On
    // unmount, ctx.revert() reverts ALL of them at once — the React-idiomatic
    // way to handle strict-mode double-effects so the second mount starts
    // from the original DOM/style state, not a half-animated one.
    const ctx = gsap.context(() => {
      const chars1 = Array.from(
        line1Ref.current?.querySelectorAll<HTMLElement>(".slide-up-char") ?? [],
      );
      const charsLife = Array.from(
        lifeRef.current?.querySelectorAll<HTMLElement>(".gsap-char") ?? [],
      );
      const chars2 = Array.from(
        line2Ref.current?.querySelectorAll<HTMLElement>(".slide-up-char") ?? [],
      );

      // Timing summary:
      // t=0.3  — "Unsure about" chars enter     (completes ~1.42s)
      // t=0.7  — "Life" chars enter             (delayed so last L char lands with
      //          Unsure's last char, completes ~1.54s)
      // t=1.6  — line1 fades + "Figured out at" enters (completes ~2.71s)
      // t=1.95 — i→I, f→F, e→E flips (stagger 0.07, completes ~2.65s)
      // t=2.85 — subtitle / CTA / attribution

      const tl = gsap.timeline();

      // Phase 1: "Unsure about" + "Life" enter
      // chars1 uses the SlideUpText per-char overflow-hidden + yPercent
      // pattern (same as "Built on / Designing Your Life"). fromTo applies
      // the from-state right at t=0.3, snapping the chars to yPercent: 140
      // + opacity: 1 (off-screen via overflow-hidden, invisible) then
      // slides them up. Before t=0.3 the chars are at SlideUpText's
      // render-time opacity: 0 so nothing flashes.
      tl.fromTo(
        chars1,
        { yPercent: 140, opacity: 1 },
        {
          yPercent: 0,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.04,
        },
        0.3,
      );
      // Life delayed to t=0.7 (was 0.4) + duration shortened 1.0→0.7 so the last
      // L-char lands ~1.54s, alongside Unsure's last char arrival at ~1.42s.
      tl.fromTo(
        charsLife,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.04 },
        0.7,
      );

      // Phase 2: "Unsure about" fades + "Figured out at" enters
      // Stagger tightened from 0.02 → 0.015 so the phrase lands ~70ms sooner.
      tl.to(
        line1Ref.current,
        { opacity: 0.3, duration: 0.5, ease: "power2.inOut" },
        1.6,
      );
      tl.fromTo(
        chars2,
        { yPercent: 140, opacity: 1 },
        {
          yPercent: 0,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.04,
        },
        1.6,
      );

      // Phase 3: i→I, f→F, e→E — char flips, started early (t=1.7, only 0.1s
      // after "Figured out at" begins entering at t=1.6) so the right column
      // reacts in sync with the left phrase rather than after a pause. Tighter
      // stagger (0.08) so the cascade reads as one fluid sweep, and smoother
      // easing (power2.inOut on exit, power2.out on enter) for a less snappy,
      // more continuous feel.
      // charsLife[0]=L (no flip), charsLife[1]=i, charsLife[2]=f, charsLife[3]=e
      const upperMap = ["I", "F", "E"];
      [1, 2, 3].forEach((charIdx, i) => {
        const char = charsLife[charIdx];
        const upper = upperMap[i];
        const t = 2.05 + i * 0.04;

        // Char exits upward (clipped by overflow-hidden — clean disappear)
        tl.to(
          char,
          {
            yPercent: -110,
            duration: 0.24,
            ease: "power2.inOut",
            onComplete: () => {
              if (char) char.textContent = upper;
            },
          },
          t,
        );

        // Char enters from below as uppercase
        tl.fromTo(
          char,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.32, ease: "power2.out" },
          t + 0.24,
        );
      });

      // Phase 4: subtitle / CTA / attribution — starts after "Figured out at"
      // entry completes (~2.71s) and the flips (last "E" enters ~2.20s).
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        2.85,
      );
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        3.05,
      );
      tl.fromTo(
        lineRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        3.2,
      );
    }, lifeRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="overflow-x-hidden w-full overflow-y-clip">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center px-6 md:px-12 pt-16 pb-16 mx-auto w-full">
        <div className="flex flex-col max-w-7xl w-full mx-auto my-auto">
          {/* 2-column hero — LIFE spans both grid rows so the two left phrases
              pin to its actual top and bottom. Reads as "Unsure about Life" / "Figured out at Life". */}
          <h1 className="grid grid-cols-[auto_auto] justify-start gap-x-[clamp(0.5rem,2vw,1.5rem)] mb-14 leading-none w-fit">
            <div ref={line1Ref} className="col-start-1 row-start-1 self-start">
              <SlideUpText
                text="Unsure about"
                className="text-headline text-fg -translate-y-[clamp(0rem,3vw,0.25rem)]"
              />
            </div>

            <div
              ref={lifeRef}
              className="col-start-2 row-start-1 row-span-2 self-center"
            >
              <LifeWord />
            </div>

            <div ref={line2Ref} className="col-start-1 row-start-2 self-end">
              <SlideUpText
                text="Figured out at"
                className="text-headline text-fg -translate-y-[clamp(0rem,3vw,0.25rem)]"
              />
            </div>
          </h1>

          <p
            ref={subtitleRef}
            className="text-md leading-8 text-muted max-w-md mb-12 opacity-0"
          >
            A guided method for people who feel stuck. Based on{" "}
            <em>Designing Your Life</em> by Burnett &amp; Evans.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-wrap items-center gap-4 opacity-0"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-full bg-fg px-8 py-3.5 text-sm font-medium text-bg hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
            >
              Get started
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                →
              </span>
            </Link>
            <Link
              href="/info"
              className="text-sm font-medium text-muted hover:text-fg transition-colors"
            >
              About the method
            </Link>
          </div>
        </div>

        <div
          ref={lineRef}
          className="absolute bottom-16 inset-x-6 md:inset-x-12 opacity-0"
        >
          <div className="max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-6 border-t border-border pt-6">
              <span className="text-xs text-muted">
                Based on Designing Your Life
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">
                Burnett &amp; Evans, Stanford
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────── */}
      <MarqueeStrip />

      {/* ── About the project ─────────────────────────────────────── */}
      <AboutProject />

      {/* ── Method movements ──────────────────────────────────────── */}
      <MethodMovements />

      {/* ── Methodology teaser ────────────────────────────────────── */}
      <MethodologyTeaser />

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <FinalCTA />
    </main>
  );
}

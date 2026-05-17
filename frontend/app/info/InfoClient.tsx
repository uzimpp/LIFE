"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MethodologyTeaser from "@/components/MethodologyTeaser";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: "intent", num: "I", label: "The intention" },
  { id: "book", num: "II", label: "The source" },
  { id: "letter", num: "III", label: "A letter" },
] as const;

// ─── Chapter index — sticky margin marker ─────────────────────────
function ChapterIndex({ active }: { active: string }) {
  return (
    <nav
      aria-label="Chapters"
      className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 text-[10px] uppercase tracking-[0.32em] font-medium"
    >
      {CHAPTERS.map(({ id, num, label }) => {
        const isActive = id === active;
        return (
          <a
            key={id}
            href={`#${id}`}
            className={`group flex items-center gap-3 transition-colors ${
              isActive ? "text-fg" : "text-muted/60 hover:text-muted"
            }`}
          >
            <span
              className={`block h-px transition-all duration-500 ${
                isActive ? "w-10 bg-fg" : "w-4 bg-border group-hover:w-6"
              }`}
            />
            <span className="tabular-nums">{num}</span>
            <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              {label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

// ─── Section heading with rule + eyebrow ──────────────────────────
function ChapterMark({ num, eyebrow }: { num: string; eyebrow: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-8">
      <span className="title-tight text-fg text-2xl tabular-nums">{num}</span>
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
        {eyebrow}
      </span>
    </div>
  );
}

export default function InfoClient() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState<string>("intent");

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      // Mask-reveal entrance for every block tagged .reveal — staggered words,
      // letters or full blocks based on the data attribute. Cheap to author,
      // keeps the choreography consistent across the page.
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      // Per-word reveal for the opening manifesto
      gsap.utils.toArray<HTMLElement>(".reveal-words").forEach((el) => {
        const words = el.querySelectorAll<HTMLElement>(".word");
        gsap.fromTo(
          words,
          { opacity: 0, y: 18, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.04,
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          },
        );
      });

      // Chapter tracker — flip the sticky index as each section enters view
      CHAPTERS.forEach(({ id }) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 40%",
          end: "bottom 40%",
          onEnter: () => setActiveChapter(id),
          onEnterBack: () => setActiveChapter(id),
        });
      });

      // Draw-in path for the connecting line between method steps
      const path = document.querySelector<SVGPathElement>("#methodLine");
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "#method",
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Helper to split text into spans for word-level reveal
  const wordSplit = (text: string) =>
    text.split(" ").map((w, i) => (
      <span key={i} className="word inline-block whitespace-pre">
        {w}
        {i < text.split(" ").length - 1 ? " " : ""}
      </span>
    ));

  return (
    <main ref={rootRef} className="relative min-h-[100dvh] overflow-x-hidden">
      <ChapterIndex active={activeChapter} />

      {/* ── Cover — manifesto ─────────────────────────────────── */}
      <section
        id="intent"
        className="relative px-6 md:px-12 pt-32 pb-24 md:pt-44 md:pb-32"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-10">
          <div className="md:col-span-2 reveal">
            <p className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
              Notes on the method
            </p>
          </div>

          <div className="md:col-span-8">
            <h1 className="reveal-words title-tight text-fg text-[clamp(2.25rem,6.5vw,5.5rem)] leading-[0.95]">
              {wordSplit(
                "This is for people who feel stuck — structurally, not emotionally.",
              )}
            </h1>
            <p className="reveal mt-10 text-base md:text-md leading-8 text-muted max-w-2xl">
              LIFE is a private tool for thinking through where you are, where
              you could go, and what actually gives you energy. Not to optimise
              productivity. Not to track habits. To think clearly about a life.
              It started as a spreadsheet shared between close friends. This is
              the version that doesn&apos;t require a spreadsheet.
            </p>
          </div>

          <div className="md:col-span-2 md:text-right reveal">
            <p className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
              Est. 2026
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
              v0.1 — Bangkok
            </p>
          </div>
        </div>
      </section>

      {/* ── Pull-quote rule ───────────────────────────────────── */}
      <section className="border-y border-border bg-surface-deep/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16 reveal">
          <p className="title italic text-fg text-[clamp(1.4rem,2.6vw,2.25rem)] leading-snug max-w-4xl">
            &ldquo;You can&rsquo;t think your way out of a problem you have to
            act your way out of.&rdquo;
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.32em] font-medium text-muted">
            Bill Burnett &amp; Dave Evans,{" "}
            <span className="italic normal-case tracking-normal text-muted/80">
              Designing Your Life
            </span>
          </p>
        </div>
      </section>

      {/* ── The source — Designing Your Life ─────────────────── */}
      <section id="book" className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <ChapterMark num="II" eyebrow="The source" />
          <MethodologyTeaser />
        </div>
      </section>

      {/* ── A letter ─────────────────────────────────────────── */}
      <section
        id="letter"
        className="px-6 md:px-12 py-24 md:py-32 bg-surface-deep/40 border-t border-border"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-10">
          <div className="md:col-span-3 md:col-start-2 reveal">
            <ChapterMark num="III" eyebrow="From the maker" />
          </div>

          <div className="md:col-span-7 md:col-start-5 space-y-8 reveal">
            <h2 className="title text-fg text-3xl md:text-4xl leading-snug">
              <em>A short note.</em>
            </h2>

            <div className="space-y-5 text-base md:text-md leading-8 text-muted">
              <p>
                Built by Worakrit Kullanatpokin. This is a personal project —
                not a product, not a startup. There are no metrics, no referral
                program, no roadmap.
              </p>
              <p>
                If it helps you think more clearly about your life, that&apos;s
                the whole point. If it doesn&apos;t, the spreadsheet still
                exists somewhere.
              </p>
            </div>

            {/* Hand-drawn signature line */}
            <div className="pt-2 flex items-end gap-6">
              <svg
                viewBox="0 0 200 60"
                className="h-14 w-44 text-fg"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <path d="M5 38 C 18 18, 28 18, 30 38 S 48 50, 58 30 C 64 18, 72 16, 76 32 C 80 46, 92 44, 96 28 C 100 14, 116 18, 118 36 C 119 46, 130 44, 138 30 S 158 20, 168 38 C 172 46, 184 44, 195 32" />
              </svg>

              <a
                href="mailto:worrakit.boss@gmail.com"
                className="text-sm text-muted hover:text-fg transition-colors underline decoration-border underline-offset-[6px] hover:decoration-fg"
              >
                worrakit.boss@gmail.com
              </a>
            </div>

            <div className="pt-12 flex flex-wrap items-center gap-6">
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 rounded-full bg-fg px-7 py-3 text-sm font-medium text-bg hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
              >
                <span>Begin a session</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bg/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
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
                href="/"
                className="text-sm text-muted hover:text-fg transition-colors"
              >
                ← Back home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

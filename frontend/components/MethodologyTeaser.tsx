"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MethodologyTeaser() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current, {
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={ref} className="px-6 md:px-12 py-24 md:py-32 opacity-0">
      <div className="flex flex-col xl:flex-row xl:max-w-7xl mx-auto gap-12 xl:gap-16 items-start justify-between">
        <div className="space-y-2 xl:flex-1">
          <p className="text-xs uppercase tracking-[0.25em] font-medium text-muted">
            The source
          </p>
          <h2 className="text-feature text-fg">
            <span className="text-nowrap">Built on</span>
            <br />
            <em>Designing Your Life</em>
          </h2>
        </div>

        <div className="flex flex-col gap-8 w-full xl:flex-1 xl:max-w-md">
          <figure className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-border bg-surface-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/burnett-evans.png"
              alt="Bill Burnett and Dave Evans, authors of Designing Your Life"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter:
                  "sepia(0.18) saturate(0.95) brightness(0.98) contrast(1.04)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply bg-bg/10"
            />
            <figcaption className="absolute bottom-4 left-4 right-4 text-[10px] uppercase tracking-[0.32em] font-medium text-bg/95 bg-fg/55 backdrop-blur-sm px-3 py-2 rounded-full text-center">
              Bill Burnett &amp; Dave Evans
            </figcaption>
          </figure>

          <div className="space-y-7">
            <p className="text-md leading-8 text-muted">
              Bill Burnett and Dave Evans at Stanford applied design thinking
              to careers and life decisions. Their Odyssey Planning method,
              the Good Time Journal, and the workview / lifeview exercises
              are the foundation of everything here.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/info"
                className="text-sm font-medium text-fg hover:text-muted transition-colors"
              >
                Read about the method →
              </Link>
              <span className="h-px w-12 bg-border" />
              <Link
                href="/login"
                className="text-sm text-muted hover:text-fg transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

type Goal = { title: string; why: string };
type EnergyDelta = { Activity: string; AvgDelta: number; Count: number };

type DashboardData = {
  snapshot?: {
    life_areas: Record<string, number>;
    interest_tags: string[];
    top_goals: Goal[];
    created_at: string;
  };
  odyssey?: {
    plan_id: string;
    created_at: string;
    top_path: { label: string; description: string; excitement: number } | null;
    path_count: number;
  };
  energy?: {
    entry_count: number;
    top_activity: string;
    summary: EnergyDelta[];
  };
};

// ─── Module card ─────────────────────────────────────────────────────────────

function ModuleCard({
  title,
  href,
  cta,
  empty,
  children,
  cardRef,
}: {
  title: string;
  href: string;
  cta: string;
  empty: boolean;
  children?: React.ReactNode;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const router = useRouter();
  return (
    <motion.div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-[2rem] border border-border p-1.5 cursor-pointer"
      onClick={() => router.push(href)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      aria-label={`Go to ${title}`}
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-surface px-6 py-5 space-y-4">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-wide font-medium text-muted">
            {title}
          </p>
          <span className="text-xs text-muted hover:text-fg transition-colors">
            {cta} →
          </span>
        </div>

        {empty ? (
          <p className="text-sm text-muted">
            Not filled out yet. Click to start.
          </p>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

// ─── Life-area mini bars ──────────────────────────────────────────────────────

function AreaBars({ areas }: { areas: Record<string, number> }) {
  const entries = Object.entries(areas).slice(0, 6);
  return (
    <div className="space-y-1.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs w-20 shrink-0 text-muted capitalize truncate">
            {key}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-surface-deep">
            <motion.div
              className="h-1.5 rounded-full bg-fg"
              initial={{ width: 0 }}
              animate={{ width: `${val * 10}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted w-4 text-right">
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ApiResponse = { data: DashboardData };

export default function MePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse>("/v1/dashboard");
      setData(res.data);
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (loading) return;

    const cards = [card1Ref.current, card2Ref.current, card3Ref.current].filter(Boolean);
    cards.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [loading]);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
    }
  }, [loading]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-fg animate-spin" />
      </main>
    );
  }

  const { snapshot, odyssey, energy } = data ?? {};

  return (
    <PageShell width="prose">
      <div className="space-y-12 py-16">

        {/* Hero */}
        <div ref={heroRef} className="space-y-3">
          <h1 className="text-headline text-fg">
            Your picture.
          </h1>
          <p className="text-base md:text-md leading-7 text-muted max-w-lg">
            A snapshot of where you are and where you might go.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">

          <ModuleCard
            title="Life snapshot"
            href="/onboarding"
            cta={snapshot ? "Update" : "Start"}
            empty={!snapshot}
            cardRef={card1Ref}
          >
            {snapshot && (
              <div className="space-y-4">
                <AreaBars areas={snapshot.life_areas} />
                {snapshot.top_goals.length > 0 && (
                  <div className="pt-1 border-t border-border">
                    <p className="text-xs text-muted mb-1.5">Top goal</p>
                    <p className="text-sm font-medium text-fg">
                      {snapshot.top_goals[0].title}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModuleCard>

          <ModuleCard
            title="Odyssey plan"
            href="/odyssey"
            cta={odyssey ? "View" : "Start"}
            empty={!odyssey}
            cardRef={card2Ref}
          >
            {odyssey && (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  {odyssey.path_count} paths mapped
                </p>
                {odyssey.top_path && (
                  <div className="rounded-2xl bg-surface-deep border border-border px-4 py-3">
                    <p className="text-xs text-muted mb-1">
                      Most exciting path
                    </p>
                    <p className="text-sm font-medium text-fg">
                      {odyssey.top_path.label}
                    </p>
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {odyssey.top_path.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModuleCard>

          <ModuleCard
            title="Energy log"
            href="/energy"
            cta={energy?.entry_count ? "Log more" : "Start"}
            empty={!energy?.entry_count}
            cardRef={card3Ref}
          >
            {energy && energy.entry_count > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  {energy.entry_count} {energy.entry_count === 1 ? "entry" : "entries"} this week
                </p>
                {energy.top_activity && (
                  <div>
                    <p className="text-xs text-muted mb-1">Top energy boost</p>
                    <p className="text-sm font-medium text-fg">
                      {energy.top_activity}
                    </p>
                  </div>
                )}
                {energy.summary.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-border">
                    {energy.summary.slice(0, 4).map((d) => {
                      const pct = Math.min(Math.abs(d.AvgDelta) * 10, 100);
                      const positive = d.AvgDelta >= 0;
                      return (
                        <div key={d.Activity} className="flex items-center gap-3">
                          <span className="text-xs w-24 shrink-0 text-muted truncate">
                            {d.Activity}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-surface-deep">
                            <motion.div
                              className="h-1.5 rounded-full"
                              style={{ backgroundColor: positive ? "#85c165" : "#c16565" }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted w-8 text-right">
                            {d.AvgDelta > 0 ? "+" : ""}{d.AvgDelta.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </ModuleCard>
        </div>
      </div>
    </PageShell>
  );
}

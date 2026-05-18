"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Flame,
  Layers,
  Plus,
  PulseLine,
} from "@/components/ui/icons";
import type { User } from "@/lib/user";

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
    top_path: {
      label: string;
      description: string;
      excitement: number;
    } | null;
    path_count: number;
  };
  energy?: {
    entry_count: number;
    top_activity: string;
    summary: EnergyDelta[];
  };
};

type ApiResponse = { data: DashboardData };

// ─── Formatting helpers ──────────────────────────────────────────────────────

function daysSince(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function relativeDay(d: number) {
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} weeks ago`;
  return `${Math.floor(d / 30)} months ago`;
}

// ─── Top stats — three editorial numbers, no card chrome ─────────────────────

function StatStrip({ data }: { data: DashboardData }) {
  const areasMeasured = data.snapshot
    ? Object.keys(data.snapshot.life_areas).length
    : 0;
  const pathsMapped = data.odyssey?.path_count ?? 0;
  const entriesLogged = data.energy?.entry_count ?? 0;

  const stats: { label: string; value: number; suffix?: string }[] = [
    { label: "Areas measured", value: areasMeasured, suffix: "/8" },
    { label: "Paths mapped", value: pathsMapped },
    { label: "Energy entries", value: entriesLogged },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-6 md:px-6 md:py-8">
          <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
            {s.label}
          </p>
          <p className="mt-3 text-fg tabular-nums title-tight leading-none text-4xl md:text-5xl">
            {s.value}
            {s.suffix && (
              <span className="text-base md:text-lg text-muted font-normal pl-1.5">
                {s.suffix}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Module shell — large clickable card with eyebrow, title, action arrow ──

function ModuleCard({
  eyebrow,
  title,
  href,
  cta,
  empty,
  emptyHint,
  cardRef,
  children,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  empty: boolean;
  emptyHint: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <motion.div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group rounded-[2rem] border border-border bg-surface overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={() => router.push(href)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      aria-label={`${title} — ${cta}`}
    >
      <div className="flex items-start justify-between px-6 md:px-7 pt-6 md:pt-7 pb-4">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
            {eyebrow}
          </p>
          <h2 className="title text-fg text-xl md:text-2xl">{title}</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted group-hover:text-fg transition-colors">
          {cta}
          <ArrowUpRight
            size={12}
            className="transition-transform duration-500 group-hover:-rotate-[20deg] group-hover:translate-x-0.5"
          />
        </span>
      </div>

      <div className="flex-1 px-6 md:px-7 pb-6 md:pb-7">
        {empty ? (
          <div className="flex flex-col items-start gap-3 pt-2">
            <p className="text-sm text-muted leading-6 max-w-xs">{emptyHint}</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-fg group-hover:border-fg transition-colors">
              <Plus size={11} />
              Begin
            </span>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

// ─── Life-area bars — all 8 areas, 2-column grid for breathability ───────────

function AreaBars({ areas }: { areas: Record<string, number> }) {
  const entries = Object.entries(areas);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs w-24 shrink-0 text-muted capitalize truncate">
            {key.replace(/_/g, " ")}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-surface-deep overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-fg"
              initial={{ width: 0 }}
              animate={{ width: `${val * 10}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-xs tabular-nums text-fg w-6 text-right font-medium">
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Odyssey podium — 3-path mini visualisation by excitement ───────────────
// Currently the API only returns the top_path (with its excitement). For the
// remaining two slots we render placeholders that still communicate "three
// paths exist" so the visual stays honest without inventing numbers.

function OdysseyPodium({
  topPath,
  pathCount,
}: {
  topPath: { label: string; description: string; excitement: number };
  pathCount: number;
}) {
  const otherCount = Math.max(0, pathCount - 1);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          <span>Most exciting path</span>
          <span className="inline-flex items-center gap-1 text-fg tabular-nums">
            <Flame size={11} />
            {topPath.excitement}
            <span className="text-muted font-normal">/10</span>
          </span>
        </div>
        <p className="text-base md:text-lg font-medium text-fg leading-snug">
          {topPath.label || "(untitled)"}
        </p>
        {topPath.description && (
          <p className="text-xs leading-5 text-muted line-clamp-3">
            {topPath.description}
          </p>
        )}
      </div>

      {otherCount > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted">
            {otherCount === 1 ? "1 other path" : `${otherCount} other paths`} in
            this plan
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Energy summary — horizontal bar list, signed colours ───────────────────

function EnergySummary({
  summary,
  topActivity,
  entryCount,
}: {
  summary: EnergyDelta[];
  topActivity: string;
  entryCount: number;
}) {
  const ranked = [...summary].sort((a, b) => b.AvgDelta - a.AvgDelta);
  const maxAbs = Math.max(1, ...ranked.map((s) => Math.abs(s.AvgDelta)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
            Top boost
          </p>
          <p className="text-base md:text-lg font-medium text-fg mt-1">
            {topActivity || "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
            This week
          </p>
          <p className="text-base md:text-lg font-medium text-fg mt-1 tabular-nums">
            {entryCount}{" "}
            <span className="text-muted text-sm font-normal">
              {entryCount === 1 ? "entry" : "entries"}
            </span>
          </p>
        </div>
      </div>

      {ranked.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          {ranked.slice(0, 6).map((d) => {
            const positive = d.AvgDelta >= 0;
            const pct = (Math.abs(d.AvgDelta) / maxAbs) * 50;
            return (
              <div
                key={d.Activity}
                className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3"
              >
                <span className="text-xs text-muted truncate">
                  {d.Activity}
                </span>
                <div className="relative h-1.5 bg-surface-deep rounded-full">
                  <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 bottom-0 rounded-full"
                    style={{
                      left: positive ? "50%" : `${50 - pct}%`,
                      backgroundColor: positive ? "#5e8a4a" : "#a85050",
                    }}
                  />
                </div>
                <span
                  className="text-xs tabular-nums text-right font-medium"
                  style={{ color: positive ? "#5e8a4a" : "#a85050" }}
                >
                  {positive ? "+" : ""}
                  {d.AvgDelta.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton — matches layout instead of a generic spinner ─────────

function DashboardSkeleton() {
  return (
    <PageShell width="dashboard">
      <div className="space-y-10 md:space-y-14 py-12 md:py-16 animate-pulse">
        <div className="space-y-4">
          <div className="h-3 w-32 bg-surface-deep rounded-full" />
          <div className="h-12 md:h-16 w-3/5 bg-surface-deep rounded-md" />
          <div className="h-4 w-2/3 bg-surface-deep rounded-full" />
        </div>
        <div className="h-24 bg-surface-deep/60 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-[2rem] bg-surface-deep/60" />
          <div className="h-64 rounded-[2rem] bg-surface-deep/60" />
        </div>
        <div className="h-64 rounded-[2rem] bg-surface-deep/60" />
      </div>
    </PageShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MeClient({ user }: { user: User }) {
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        );
      }
      const cards = [
        card1Ref.current,
        card2Ref.current,
        card3Ref.current,
      ].filter(Boolean);
      cards.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            delay: 0.15 + i * 0.08,
            scrollTrigger: { trigger: el, start: "top 92%" },
          },
        );
      });
    });
    return () => ctx.revert();
  }, [loading]);

  if (loading) return <DashboardSkeleton />;

  const { snapshot, odyssey, energy } = data ?? {};
  const firstName = user.name?.split(" ")[0] ?? "you";
  const snapshotDays = snapshot ? daysSince(snapshot.created_at) : null;

  return (
    <PageShell width="dashboard">
      <div className="space-y-10 md:space-y-14 py-12 md:py-16">
        {/* ── Greeting ─────────────────────────────────────────────── */}
        <div ref={heroRef} className="space-y-4">
          <h1 className="title text-fg leading-[1.05]">
            <span className="text-headline italic text-fg capitalize">
              {firstName}
            </span>
            <span className="text-subheadline text-fg/42">&apos;s space</span>
          </h1>
          <p className="text-base md:text-md leading-7 text-muted max-w-xl">
            {snapshotDays !== null && snapshot && (
              <>
                {" "}
                Last reflection&nbsp;
                <span className="text-fg">{relativeDay(snapshotDays)}</span>.
              </>
            )}
          </p>
        </div>

        {/* ── Stat strip ───────────────────────────────────────────── */}
        <StatStrip data={data ?? {}} />

        {/* ── Two-up bento: snapshot + odyssey ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <ModuleCard
            eyebrow="01 — Calibration"
            title="Life snapshot"
            href="/onboarding"
            cta={snapshot ? "Update" : "Start"}
            empty={!snapshot}
            emptyHint="Rate eight areas of your life, pick tags, name three goals. Ten minutes."
            cardRef={card1Ref}
          >
            {snapshot && (
              <div className="space-y-5">
                <AreaBars areas={snapshot.life_areas} />
                {snapshot.top_goals[0]?.title && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
                      Top goal
                    </p>
                    <p className="text-sm font-medium text-fg leading-snug">
                      {snapshot.top_goals[0].title}
                    </p>
                    {snapshot.top_goals[0].why && (
                      <p className="text-xs text-muted leading-5 line-clamp-2">
                        {snapshot.top_goals[0].why}
                      </p>
                    )}
                  </div>
                )}
                {snapshot.interest_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
                    {snapshot.interest_tags.slice(0, 10).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-surface-deep px-2.5 py-1 text-[10px] text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ModuleCard>

          <ModuleCard
            eyebrow="02 — Imagination"
            title="Odyssey plan"
            href="/odyssey"
            cta={odyssey ? "View" : "Start"}
            empty={!odyssey}
            emptyHint="Write three five-year paths — the one you're on, an alternate, and a radical one."
            cardRef={card2Ref}
          >
            {odyssey?.top_path && (
              <OdysseyPodium
                topPath={odyssey.top_path}
                pathCount={odyssey.path_count}
              />
            )}
          </ModuleCard>
        </div>

        {/* ── Full-width energy card ───────────────────────────────── */}
        <ModuleCard
          eyebrow="03 — Observation"
          title="Energy log"
          href="/energy"
          cta={energy?.entry_count ? "Log more" : "Start"}
          empty={!energy?.entry_count}
          emptyHint="Track activities and the energy they give or take. Patterns surface in a week or two."
          cardRef={card3Ref}
        >
          {energy && energy.entry_count > 0 && (
            <EnergySummary
              summary={energy.summary}
              topActivity={energy.top_activity}
              entryCount={energy.entry_count}
            />
          )}
        </ModuleCard>

        {/* ── Quick actions — terse and direct ─────────────────────── */}
        <div className="pt-6 md:pt-8 border-t border-border">
          <div className="flex items-center gap-4 mb-6">
            <span aria-hidden className="h-px w-10 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
              Continue
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <QuickAction
              href="/onboarding/new"
              icon={<Layers size={14} />}
              label="New snapshot"
            />
            <QuickAction
              href="/odyssey/new"
              icon={<Compass size={14} />}
              label="New plan"
            />
            <QuickAction
              href="/energy/new"
              icon={<PulseLine size={14} />}
              label="Log activity"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4 hover:border-fg transition-colors"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-fg">
        <span className="text-muted group-hover:text-fg transition-colors">
          {icon}
        </span>
        {label}
      </span>
      <ArrowRight
        size={14}
        className="text-muted group-hover:text-fg group-hover:translate-x-0.5 transition-all duration-300"
      />
    </Link>
  );
}

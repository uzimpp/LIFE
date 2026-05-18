"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";
import { ArrowRight, Plus } from "@/components/ui/icons";

type Goal = { title: string; why: string };

type Snapshot = {
  id: string;
  life_areas: Record<string, number>;
  interest_tags: string[];
  top_goals: Goal[];
  created_at: string;
};

type ApiResponse<T> = { data: T };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Snapshot card ───────────────────────────────────────────────────────────
// Wider layout: header strip + 2-column grid (left = all 8 area bars, right =
// goals stack + tag cloud). Mobile collapses to single column. No data
// truncation — the whole snapshot fits in one card now.

function SnapshotCard({
  snapshot,
  index,
}: {
  snapshot: Snapshot;
  index: number;
}) {
  const areas = Object.entries(snapshot.life_areas);
  const goals = snapshot.top_goals.filter((g) => g.title);

  return (
    <div className="rounded-[2rem] border border-border bg-surface overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-4 px-6 md:px-8 pt-5 md:pt-6 pb-4 border-b border-border">
        <div className="flex items-baseline gap-3 md:gap-4">
          <span className="title-tight text-fg text-2xl md:text-3xl tabular-nums leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              Snapshot
            </p>
            <p className="text-sm text-fg">{formatDate(snapshot.created_at)}</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          {areas.length} areas
          <span aria-hidden>·</span>
          {goals.length} {goals.length === 1 ? "goal" : "goals"}
          <span aria-hidden>·</span>
          {snapshot.interest_tags.length} tags
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left: life areas — 2 columns at md+, all 8 visible */}
        <div className="px-6 md:px-8 py-6 md:py-7">
          <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted mb-5">
            Life areas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {areas.map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs w-24 shrink-0 text-muted capitalize truncate">
                  {key.replace(/_/g, " ")}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-surface-deep overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-fg"
                    initial={{ width: 0 }}
                    animate={{ width: `${val * 10}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-xs tabular-nums text-fg w-6 text-right font-medium">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: goals + tags */}
        <div className="px-6 md:px-8 py-6 md:py-7 space-y-6">
          {goals.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
                Goals
              </p>
              <ul className="space-y-3">
                {goals.map((g, i) => (
                  <li key={i} className="space-y-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-[10px] tabular-nums text-muted mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm font-medium text-fg leading-snug">
                        {g.title}
                      </p>
                    </div>
                    {g.why && (
                      <p className="text-xs text-muted leading-5 pl-[1.5rem]">
                        {g.why}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {snapshot.interest_tags.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {snapshot.interest_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface-deep px-3 py-1 text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Snapshot[]>>("/v1/snapshots");
      setSnapshots(res.data ?? []);
    } catch {
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageShell width="wide">
        <div className="space-y-10 py-12 md:py-16 animate-pulse">
          <div className="h-12 md:h-16 w-2/3 bg-surface-deep rounded-md" />
          <div className="h-4 w-1/2 bg-surface-deep rounded-full" />
          <div className="h-56 rounded-[2rem] bg-surface-deep/60" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="wide">
      <div className="space-y-12 md:space-y-14 py-12 md:py-16">
        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
          <div className="space-y-4">
            <h1 className="text-headline text-fg leading-[1.05]">
              Life <span className="italic text-fg/85">snapshots.</span>
            </h1>
            <p className="text-base md:text-md leading-7 text-muted max-w-lg">
              A record of where you were at different points in time. Eight
              areas, your tags, and the goals you named.
            </p>
          </div>

          <Link
            href="/onboarding/new"
            className="group inline-flex items-center gap-2.5 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-85 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg shrink-0"
          >
            <Plus size={14} />
            New snapshot
          </Link>
        </div>

        {snapshots.length > 0 ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              <span aria-hidden className="h-px w-8 bg-border" />
              <span className="tabular-nums">
                {snapshots.length}{" "}
                {snapshots.length === 1 ? "snapshot" : "snapshots"}
              </span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-4">
              {snapshots.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <SnapshotCard snapshot={s} index={i} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </PageShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-border px-6 md:px-10 py-12 md:py-16 flex flex-col items-start gap-5 bg-surface/40">
      <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
        Empty
      </span>
      <h2 className="title text-fg text-2xl md:text-3xl max-w-md">
        No snapshots yet.
      </h2>
      <p className="text-base text-muted max-w-md leading-7">
        Your first snapshot takes about ten minutes. Rate eight areas, pick a
        few tags, name three goals. We&rsquo;ll keep it here, dated, so you can
        see how you change.
      </p>
      <Link
        href="/onboarding/new"
        className="group inline-flex items-center gap-2 text-sm font-medium text-fg hover:opacity-80 transition-opacity"
      >
        Take your first snapshot
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

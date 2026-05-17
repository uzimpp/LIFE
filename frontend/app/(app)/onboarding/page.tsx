"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

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

function SnapshotCard({
  snapshot,
  index,
}: {
  snapshot: Snapshot;
  index: number;
}) {
  const areas = Object.entries(snapshot.life_areas).slice(0, 6);
  return (
    <div className="rounded-[2rem] border border-border p-1.5">
      <div className="rounded-[calc(2rem-0.375rem)] bg-surface overflow-hidden">
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border">
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-muted">
            Snapshot {index + 1}
          </span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">
            {formatDate(snapshot.created_at)}
          </span>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            {areas.map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs w-24 shrink-0 text-muted capitalize truncate">
                  {key}
                </span>
                <div className="flex-1 h-1 rounded-full bg-surface-deep">
                  <motion.div
                    className="h-1 rounded-full bg-fg"
                    initial={{ width: 0 }}
                    animate={{ width: `${val * 10}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted w-4 text-right">
                  {val}
                </span>
              </div>
            ))}
          </div>
          {snapshot.top_goals.length > 0 && snapshot.top_goals[0].title && (
            <div className="pt-1 border-t border-border space-y-0.5">
              <p className="text-xs text-muted">Top goal</p>
              <p className="text-sm font-medium text-fg">
                {snapshot.top_goals[0].title}
              </p>
              {snapshot.top_goals[0].why && (
                <p className="text-xs text-muted leading-5">
                  {snapshot.top_goals[0].why}
                </p>
              )}
            </div>
          )}
          {snapshot.interest_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
              {snapshot.interest_tags.slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-deep px-3 py-1 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <main className="min-h-[100dvh] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-fg animate-spin" />
      </main>
    );
  }

  return (
    <PageShell width="prose">
      <div className="space-y-12 py-16">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-headline text-fg title-tight">
              Life snapshots.
            </h1>
            <p className="text-base md:text-md leading-7 text-muted">
              A record of where you were at different points in time.
            </p>
          </div>
          <Link
            href="/onboarding/new"
            className="shrink-0 rounded-full bg-fg px-6 py-2.5 text-sm font-medium text-bg hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
          >
            New snapshot →
          </Link>
        </div>

        {snapshots.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted">
              {snapshots.length}{" "}
              {snapshots.length === 1 ? "snapshot" : "snapshots"}
            </p>
            {snapshots.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
              >
                <SnapshotCard snapshot={s} index={i} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 space-y-4 border-t border-border">
            <p className="text-base text-muted">No snapshots yet.</p>
            <Link
              href="/onboarding/new"
              className="text-sm text-muted hover:text-fg transition-colors"
            >
              Take your first snapshot →
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}

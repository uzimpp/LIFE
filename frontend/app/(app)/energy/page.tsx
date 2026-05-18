"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";
import { ArrowRight, Plus } from "@/components/ui/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type EnergyEntry = {
  id: string;
  activity: string;
  started_at: string;
  ended_at: string;
  energy_before: number;
  energy_after: number;
  notes: string;
};

type EnergyDelta = { Activity: string; AvgDelta: number; Count: number };
type ApiResponse<T> = { data: T };

const POSITIVE_STRONG = "#5e8a4a";
const POSITIVE_SOFT = "#8aab73";
const NEUTRAL = "#8a8377";
const NEGATIVE = "#a85050";

function deltaColor(delta: number): string {
  if (delta > 2) return POSITIVE_STRONG;
  if (delta > 0) return POSITIVE_SOFT;
  if (delta === 0) return NEUTRAL;
  return NEGATIVE;
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Chart tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: EnergyDelta }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sign = d.AvgDelta > 0 ? "+" : "";
  return (
    <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-md px-3.5 py-2.5 text-xs shadow-sm">
      <p className="font-medium text-fg">{d.Activity}</p>
      <p className="text-muted mt-0.5 tabular-nums">
        avg delta {sign}
        {d.AvgDelta.toFixed(1)} &middot; {d.Count}{" "}
        {d.Count === 1 ? "session" : "sessions"}
      </p>
    </div>
  );
}

// ─── Summary strip — three editorial numbers ─────────────────────────────────

function SummaryStrip({
  entries,
  summary,
}: {
  entries: EnergyEntry[];
  summary: EnergyDelta[];
}) {
  const totalDeltaAvg = useMemo(() => {
    if (!entries.length) return 0;
    const sum = entries.reduce(
      (acc, e) => acc + (e.energy_after - e.energy_before),
      0,
    );
    return sum / entries.length;
  }, [entries]);

  const best = useMemo(
    () => summary.reduce<EnergyDelta | null>(
      (acc, s) => (!acc || s.AvgDelta > acc.AvgDelta ? s : acc),
      null,
    ),
    [summary],
  );
  const worst = useMemo(
    () => summary.reduce<EnergyDelta | null>(
      (acc, s) => (!acc || s.AvgDelta < acc.AvgDelta ? s : acc),
      null,
    ),
    [summary],
  );

  return (
    <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
      <div className="px-4 py-6 md:px-6 md:py-7">
        <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          Sessions logged
        </p>
        <p className="mt-3 text-fg tabular-nums title-tight leading-none text-3xl md:text-4xl">
          {entries.length}
        </p>
      </div>

      <div className="px-4 py-6 md:px-6 md:py-7">
        <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          Avg delta
        </p>
        <p
          className="mt-3 tabular-nums title-tight leading-none text-3xl md:text-4xl"
          style={{ color: deltaColor(totalDeltaAvg) }}
        >
          {totalDeltaAvg > 0 ? "+" : ""}
          {totalDeltaAvg.toFixed(1)}
        </p>
      </div>

      <div className="px-4 py-6 md:px-6 md:py-7">
        <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          {best && worst && worst.AvgDelta < 0 ? "Lifts & drains" : "Best"}
        </p>
        <div className="mt-3 space-y-1">
          {best && (
            <p className="text-sm md:text-base font-medium text-fg leading-tight truncate">
              {best.Activity}
              <span
                className="pl-2 text-xs tabular-nums"
                style={{ color: deltaColor(best.AvgDelta) }}
              >
                {best.AvgDelta > 0 ? "+" : ""}
                {best.AvgDelta.toFixed(1)}
              </span>
            </p>
          )}
          {worst && worst.AvgDelta < 0 && (
            <p className="text-xs text-muted truncate">
              {worst.Activity}
              <span
                className="pl-2 tabular-nums"
                style={{ color: NEGATIVE }}
              >
                {worst.AvgDelta.toFixed(1)}
              </span>
            </p>
          )}
          {!best && <p className="text-sm text-muted">—</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Entry tile ──────────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: EnergyEntry }) {
  const delta = entry.energy_after - entry.energy_before;
  const sign = delta > 0 ? "+" : "";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-border bg-surface px-4 md:px-5 py-3.5 flex items-center justify-between gap-4"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg truncate">{entry.activity}</p>
        <p className="text-xs text-muted mt-0.5">
          {formatDay(entry.started_at)}
        </p>
        {entry.notes && (
          <p className="text-xs text-muted mt-1.5 leading-5 line-clamp-2">
            {entry.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.24em] font-medium text-muted tabular-nums">
          {entry.energy_before}
          <span className="px-1 text-muted/60">&rarr;</span>
          {entry.energy_after}
        </span>
        <span
          className="text-base font-medium tabular-nums w-10 text-right"
          style={{ color: deltaColor(delta) }}
        >
          {sign}
          {delta}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EnergyPage() {
  const [entries, setEntries] = useState<EnergyEntry[]>([]);
  const [summary, setSummary] = useState<EnergyDelta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        api.get<ApiResponse<EnergyEntry[]>>("/v1/energy"),
        api.get<ApiResponse<EnergyDelta[]>>("/v1/energy/summary?days=7"),
      ]);
      setEntries(entriesRes.data ?? []);
      setSummary(summaryRes.data ?? []);
    } catch {
      // silently degrade
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
          <div className="h-72 rounded-[2rem] bg-surface-deep/60" />
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
              Energy <span className="italic text-fg/85">log.</span>
            </h1>
            <p className="text-base md:text-md leading-7 text-muted max-w-lg">
              Track how activities shift your energy. The goal isn&rsquo;t to
              avoid what drains you &mdash; it&rsquo;s to know which drains
              you more than you expect.
            </p>
          </div>

          <Link
            href="/energy/new"
            className="group inline-flex items-center gap-2.5 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-85 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg shrink-0"
          >
            <Plus size={14} />
            Log entry
          </Link>
        </div>

        {entries.length > 0 && (
          <SummaryStrip entries={entries} summary={summary} />
        )}

        {summary.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              <span aria-hidden className="h-px w-8 bg-border" />
              <span>This week &mdash; avg delta by activity</span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <div className="rounded-[2rem] border border-border bg-surface px-3 md:px-6 pt-6 pb-3">
              <div className="h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary}
                    margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke="var(--color-border)"
                      strokeDasharray="2 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="Activity"
                      tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--color-border)"
                      strokeWidth={1}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--color-surface-deep)", opacity: 0.4 }}
                    />
                    <Bar dataKey="AvgDelta" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {summary.map((d, i) => (
                        <Cell key={i} fill={deltaColor(d.AvgDelta)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {entries.length > 0 ? (
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              <span aria-hidden className="h-px w-8 bg-border" />
              <span className="tabular-nums">
                {entries.length}{" "}
                {entries.length === 1 ? "entry" : "entries"}
              </span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entries.slice(0, 30).map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            </AnimatePresence>
          </section>
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
        No entries yet.
      </h2>
      <p className="text-base text-muted max-w-md leading-7">
        Log a single activity to begin. Rate your energy before and after.
        After a week or two, the patterns surface on their own.
      </p>
      <Link
        href="/energy/new"
        className="group inline-flex items-center gap-2 text-sm font-medium text-fg hover:opacity-80 transition-opacity"
      >
        Log your first activity
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

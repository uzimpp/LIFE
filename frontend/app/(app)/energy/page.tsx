"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

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

function deltaColor(delta: number): string {
  if (delta > 2) return "#85c165";
  if (delta > 0) return "#a3c98a";
  if (delta === 0) return "#6B6860";
  return "#c16565";
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: EnergyDelta }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sign = d.AvgDelta > 0 ? "+" : "";
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-fg">{d.Activity}</p>
      <p className="text-muted">avg delta {sign}{d.AvgDelta.toFixed(1)} · {d.Count} {d.Count === 1 ? "session" : "sessions"}</p>
    </div>
  );
}

function EntryCard({ entry }: { entry: EnergyEntry }) {
  const delta = entry.energy_after - entry.energy_before;
  const sign = delta > 0 ? "+" : "";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
    >
      <div>
        <p className="text-sm font-medium text-fg">{entry.activity}</p>
        <p className="text-xs text-muted mt-0.5">
          {new Date(entry.started_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>
      <span className="text-sm font-medium tabular-nums" style={{ color: deltaColor(delta) }}>
        {sign}{delta}
      </span>
    </motion.div>
  );
}

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

  useEffect(() => { load(); }, [load]);

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
            <h1 className="text-headline text-fg title-tight">Energy log.</h1>
            <p className="text-base md:text-md leading-7 text-muted">Track how activities shift your energy.</p>
          </div>
          <Link
            href="/energy/new"
            className="shrink-0 rounded-full bg-fg px-6 py-2.5 text-sm font-medium text-bg hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
          >
            Log entry →
          </Link>
        </div>

        {summary.length > 0 && (
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted">
              This week — avg delta by activity
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="Activity" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
                  <Bar dataKey="AvgDelta" radius={[4, 4, 0, 0]}>
                    {summary.map((d, i) => <Cell key={i} fill={deltaColor(d.AvgDelta)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {entries.length > 0 ? (
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {entries.slice(0, 20).map((e) => <EntryCard key={e.id} entry={e} />)}
              </div>
            </AnimatePresence>
          </section>
        ) : (
          <div className="py-12 space-y-4 border-t border-border">
            <p className="text-base text-muted">No entries yet.</p>
            <Link href="/energy/new" className="text-sm text-muted hover:text-fg transition-colors">
              Log your first activity →
            </Link>
          </div>
        )}

      </div>
    </PageShell>
  );
}

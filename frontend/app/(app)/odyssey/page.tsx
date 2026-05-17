"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Target, Flame } from "lucide-react";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

// ─── Types ────────────────────────────────────────────────────────────────────

type OdysseyPath = {
  id: string;
  sort_order: number;
  label: string;
  description: string;
  timeline_text: string;
  likeability: number;
  confidence: number;
  excitement: number;
};

type OdysseyPlan = {
  id: string;
  paths: OdysseyPath[];
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PATH_LABELS = ["A", "B", "C"];
const PATH_EYEBROWS = [
  "The path you're on",
  "If plan A were gone",
  "The one you're afraid to say",
];

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: OdysseyPlan; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[2rem] border border-border p-1.5">
      <div className="rounded-[calc(2rem-0.375rem)] bg-surface overflow-hidden">

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-muted">
              Plan {index + 1}
            </span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{formatDate(plan.created_at)}</span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted hover:text-fg transition-colors cursor-pointer"
          >
            {expanded ? "Collapse ↑" : "Expand ↓"}
          </button>
        </div>

        {/* 3-path summary grid */}
        <div className="grid grid-cols-3 divide-x divide-border">
          {plan.paths.map((path, pi) => (
            <div key={path.id} className="px-5 py-5 space-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted">
                  Plan {PATH_LABELS[pi]}
                </p>
                <p className="text-sm font-medium text-fg leading-snug line-clamp-2">
                  {path.label || "(untitled)"}
                </p>
              </div>
              <div className="flex gap-3">
                {[
                  { icon: <Heart size={11} strokeWidth={1.5} />, val: path.likeability, label: "Likeability" },
                  { icon: <Target size={11} strokeWidth={1.5} />, val: path.confidence, label: "Confidence" },
                  { icon: <Flame size={11} strokeWidth={1.5} />, val: path.excitement, label: "Excitement" },
                ].map(({ icon, val, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1" title={label}>
                    <span className="text-muted">{icon}</span>
                    <span className="text-sm font-medium tabular-nums text-fg">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-border divide-y divide-border">
                {plan.paths.map((path, pi) => (
                  <div key={path.id} className="px-6 py-6 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted">
                        Plan {PATH_LABELS[pi]} — {PATH_EYEBROWS[pi]}
                      </p>
                      <p className="title text-2xl text-fg">{path.label || "(untitled)"}</p>
                    </div>
                    {path.description && (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide font-medium text-muted">Five years from now</p>
                        <p className="text-sm leading-6 text-fg">{path.description}</p>
                      </div>
                    )}
                    {path.timeline_text && (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide font-medium text-muted">Key moves</p>
                        <p className="text-sm leading-6 text-fg">{path.timeline_text}</p>
                      </div>
                    )}
                    <div className="flex gap-8 pt-1">
                      {[
                        { label: "Likeability", val: path.likeability },
                        { label: "Confidence", val: path.confidence },
                        { label: "Excitement", val: path.excitement },
                      ].map(({ label, val }) => (
                        <div key={label} className="space-y-0.5">
                          <p className="text-xs text-muted">{label}</p>
                          <p className="text-lg font-medium tabular-nums text-fg">
                            {val}<span className="text-xs text-muted font-normal">/10</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ApiResponse<T> = { data: T };

export default function OdysseyPage() {
  const [plans, setPlans] = useState<OdysseyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<OdysseyPlan[]>>("/v1/odyssey");
      setPlans(res.data ?? []);
    } catch {
      setPlans([]);
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
            <h1 className="text-headline text-fg title-tight">Odyssey plans.</h1>
            <p className="text-base md:text-md leading-7 text-muted">
              Each plan is a snapshot of three possible futures.
            </p>
          </div>
          <Link
            href="/odyssey/new"
            className="shrink-0 rounded-full bg-fg px-6 py-2.5 text-sm font-medium text-bg hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
          >
            New plan →
          </Link>
        </div>

        {plans.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-muted">
              {plans.length} {plans.length === 1 ? "plan" : "plans"}
            </p>
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
              >
                <PlanCard plan={plan} index={i} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 space-y-4 border-t border-border">
            <p className="text-base text-muted">No plans yet.</p>
            <Link href="/odyssey/new" className="text-sm text-muted hover:text-fg transition-colors">
              Start your first odyssey plan →
            </Link>
          </div>
        )}

      </div>
    </PageShell>
  );
}

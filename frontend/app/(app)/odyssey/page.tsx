"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  Plus,
  Target,
} from "@/components/ui/icons";

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

type ApiResponse<T> = { data: T };

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

const SCORE_AXES = [
  { key: "likeability" as const, label: "Likeability", Icon: Heart },
  { key: "confidence" as const, label: "Confidence", Icon: Target },
  { key: "excitement" as const, label: "Excitement", Icon: Flame },
];

// ─── Path summary tile — used inside the collapsed plan card ────────────────

function PathSummaryTile({ path, label }: { path: OdysseyPath; label: string }) {
  return (
    <div className="px-5 md:px-6 py-5 space-y-4 h-full">
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          Plan {label}
        </p>
        <p className="text-sm md:text-base font-medium text-fg leading-snug line-clamp-2 min-h-[2.5em]">
          {path.label || "(untitled)"}
        </p>
        {path.description && (
          <p className="text-xs text-muted leading-5 line-clamp-2">
            {path.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
        {SCORE_AXES.map(({ key, label: axisLabel, Icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1.5"
            title={axisLabel}
          >
            <span className="text-muted">
              <Icon size={12} />
            </span>
            <span className="text-sm font-medium tabular-nums text-fg">
              {path[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Expanded path detail — full description + scores in big numbers ────────

function PathDetail({
  path,
  label,
  eyebrow,
}: {
  path: OdysseyPath;
  label: string;
  eyebrow: string;
}) {
  return (
    <div className="px-6 md:px-8 py-6 md:py-7 space-y-5">
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
          Plan {label} &mdash; {eyebrow}
        </p>
        <p className="title text-fg text-2xl md:text-3xl leading-tight">
          {path.label || "(untitled)"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {path.description && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              Five years from now
            </p>
            <p className="text-sm leading-6 text-fg">{path.description}</p>
          </div>
        )}
        {path.timeline_text && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              Key moves
            </p>
            <p className="text-sm leading-6 text-fg">{path.timeline_text}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-border">
        {SCORE_AXES.map(({ key, label: axisLabel, Icon }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-muted">
              <Icon size={14} />
            </span>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
                {axisLabel}
              </p>
              <p className="text-lg font-medium tabular-nums text-fg leading-none">
                {path[key]}
                <span className="text-xs text-muted font-normal pl-0.5">
                  /10
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: OdysseyPlan; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="rounded-4xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 md:px-8 pt-5 md:pt-6 pb-4 border-b border-border">
        <div className="flex items-baseline gap-3 md:gap-4">
          <span className="title-tight text-fg text-2xl md:text-3xl tabular-nums leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              Plan
            </p>
            <p className="text-sm text-fg">{formatDate(plan.created_at)}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors cursor-pointer"
        >
          {expanded ? "Collapse" : "Expand"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Compact 3-path summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {plan.paths.map((path, pi) => (
          <PathSummaryTile key={path.id} path={path} label={PATH_LABELS[pi]} />
        ))}
      </div>

      {/* Expanded detail — 3 stacked PathDetail blocks */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border divide-y divide-border">
              {plan.paths.map((path, pi) => (
                <PathDetail
                  key={path.id}
                  path={path}
                  label={PATH_LABELS[pi]}
                  eyebrow={PATH_EYEBROWS[pi]}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageShell width="wide">
        <div className="space-y-10 py-12 md:py-16 animate-pulse">
          <div className="h-12 md:h-16 w-2/3 bg-surface-deep rounded-md" />
          <div className="h-4 w-1/2 bg-surface-deep rounded-full" />
          <div className="h-64 rounded-4xl bg-surface-deep/60" />
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
              Odyssey <span className="italic text-fg/85">plans.</span>
            </h1>
            <p className="text-base md:text-md leading-7 text-muted max-w-lg">
              Each plan is a snapshot of three possible futures. The most
              useful number is often the gap between scores, not the scores
              themselves.
            </p>
          </div>

          <Link
            href="/odyssey/new"
            className="group inline-flex items-center gap-2.5 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg hover:opacity-85 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg shrink-0"
          >
            <Plus size={14} />
            New plan
          </Link>
        </div>

        {plans.length > 0 ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] font-medium text-muted">
              <span aria-hidden className="h-px w-8 bg-border" />
              <span className="tabular-nums">
                {plans.length} {plans.length === 1 ? "plan" : "plans"}
              </span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-4">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <PlanCard plan={plan} index={i} />
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
        No plans yet.
      </h2>
      <p className="text-base text-muted max-w-md leading-7">
        Write three five-year scenarios: the path you&rsquo;re on, an
        alternate, and a radically different one. Rate each on likeability,
        confidence, and excitement.
      </p>
      <Link
        href="/odyssey/new"
        className="group inline-flex items-center gap-2 text-sm font-medium text-fg hover:opacity-80 transition-opacity"
      >
        Start your first odyssey plan
        <ArrowRight
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

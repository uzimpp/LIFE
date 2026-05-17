"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

// ─── Data ────────────────────────────────────────────────────────────────────

const LIFE_AREAS = [
  { key: "health", label: "Health & Body" },
  { key: "career", label: "Career & Work" },
  { key: "money", label: "Money & Finances" },
  { key: "relationships", label: "Relationships" },
  { key: "fun", label: "Fun & Play" },
  { key: "growth", label: "Personal Growth" },
  { key: "home", label: "Home & Environment" },
  { key: "purpose", label: "Purpose & Spirit" },
];

const INTEREST_TAGS = [
  "Reading", "Writing", "Running", "Yoga", "Travel", "Cooking",
  "Music", "Art", "Films", "Gaming", "Hiking", "Photography",
  "Coding", "Meditation", "Dancing", "Volunteering", "Crafts", "Nature",
];

type Goal = { title: string; why: string };

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${i <= current ? "bg-fg" : "bg-border"}`} />
      ))}
    </div>
  );
}

// ─── Step 1: Life area sliders ────────────────────────────────────────────────

function Step1({ areas, onChange }: {
  areas: Record<string, number>;
  onChange: (key: string, val: number) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="title text-3xl md:text-4xl text-fg">Where are you right now?</h2>
        <p className="mt-4 text-base md:text-md leading-7 text-muted max-w-lg">Rate each area of life. No right answers — just honest ones.</p>
      </div>
      <div className="space-y-6">
        {LIFE_AREAS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-fg">{label}</label>
              <motion.span key={areas[key]} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs tabular-nums text-muted">
                {areas[key]} / 10
              </motion.span>
            </div>
            <motion.div whileTap={{ scaleY: 1.05 }}>
              <input
                type="range" min={1} max={10} value={areas[key]}
                onChange={(e) => onChange(key, Number(e.target.value))}
                aria-label={label}
                className="w-full h-1 rounded-full appearance-none cursor-pointer bg-surface-deep [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Tag picker ───────────────────────────────────────────────────────

function Step2({ selected, onToggle }: {
  selected: Set<string>;
  onToggle: (tag: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="title text-3xl md:text-4xl text-fg">What draws you in?</h2>
        <p className="mt-4 text-base md:text-md leading-7 text-muted max-w-lg">
          Pick anything that feels true, even if you haven&apos;t done it in years.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {INTEREST_TAGS.map((tag) => {
          const active = selected.has(tag);
          return (
            <motion.button
              key={tag}
              onClick={() => onToggle(tag)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 ${
                active
                  ? "bg-fg text-bg"
                  : "border border-border text-muted hover:border-fg hover:text-fg"
              }`}
              aria-pressed={active}
            >
              {tag}
            </motion.button>
          );
        })}
      </div>
      {selected.size === 0 && <p className="text-xs text-muted">Select at least one to continue.</p>}
    </div>
  );
}

// ─── Step 3: Goals ────────────────────────────────────────────────────────────

function Step3({ goals, onChange }: {
  goals: Goal[];
  onChange: (index: number, field: "title" | "why", value: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="title text-3xl md:text-4xl text-fg">Three paths forward.</h2>
        <p className="mt-4 text-base md:text-md leading-7 text-muted max-w-lg">Name three things you want, and why they matter.</p>
      </div>
      <div className="space-y-8">
        {goals.map((g, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.35 }} className="space-y-3">
            <p className="text-xs uppercase tracking-wide font-medium text-muted">Goal {i + 1}</p>
            <div className="space-y-2">
              <label htmlFor={`goal-title-${i}`} className="text-sm font-medium text-fg">What do you want?</label>
              <input
                id={`goal-title-${i}`}
                type="text"
                value={g.title}
                onChange={(e) => onChange(i, "title", e.target.value)}
                placeholder="e.g. Work that feels meaningful"
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`goal-why-${i}`} className="text-sm font-medium text-fg">Why does it matter?</label>
              <textarea
                id={`goal-why-${i}`}
                rows={2}
                value={g.why}
                onChange={(e) => onChange(i, "why", e.target.value)}
                placeholder="e.g. I want to feel proud of how I spend my time"
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-muted resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 transition-colors"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

export default function NewOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [areas, setAreas] = useState<Record<string, number>>(
    Object.fromEntries(LIFE_AREAS.map((a) => [a.key, 5]))
  );
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [goals, setGoals] = useState<Goal[]>([
    { title: "", why: "" }, { title: "", why: "" }, { title: "", why: "" },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stepLabels = ["Your life now", "What you love", "Where you're headed"];

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0, x: direction * 24 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
  }, [step, direction]);

  function canAdvance() {
    if (step === 1) return tags.size > 0;
    if (step === 2) return goals.every((g) => g.title.trim().length > 0);
    return true;
  }

  function advance() {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      gsap.to(containerRef.current, {
        opacity: 0, x: -24, duration: 0.25, ease: "power2.in",
        onComplete: () => setStep((s) => s + 1),
      });
    } else {
      handleSubmit();
    }
  }

  function back() {
    if (step > 0) {
      setDirection(-1);
      gsap.to(containerRef.current, {
        opacity: 0, x: 24, duration: 0.25, ease: "power2.in",
        onComplete: () => setStep((s) => s - 1),
      });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/v1/snapshots", {
        life_areas: areas,
        interest_tags: Array.from(tags),
        top_goals: goals.map((g) => ({ title: g.title.trim(), why: g.why.trim() })),
      });
      toast.success("Snapshot saved.");
      router.push("/onboarding");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <PageShell width="prose">
      <div className="space-y-10 py-16">

        <Link href="/onboarding" className="text-sm text-muted hover:text-fg transition-colors">
          ← Life snapshots
        </Link>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide font-medium text-muted">
            Step {step + 1} of {TOTAL_STEPS} — {stepLabels[step]}
          </p>
          <StepBar current={step} total={TOTAL_STEPS} />
        </div>

        <div ref={containerRef}>
          {step === 0 && (
            <Step1 areas={areas} onChange={(key, val) => setAreas((prev) => ({ ...prev, [key]: val }))} />
          )}
          {step === 1 && (
            <Step2
              selected={tags}
              onToggle={(tag) => setTags((prev) => {
                const next = new Set(prev);
                next.has(tag) ? next.delete(tag) : next.add(tag);
                return next;
              })}
            />
          )}
          {step === 2 && (
            <Step3
              goals={goals}
              onChange={(i, field, value) =>
                setGoals((prev) => prev.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)))
              }
            />
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-600">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={back}
            disabled={step === 0}
            className="text-sm text-muted hover:text-fg disabled:opacity-0 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Back
          </button>
          <motion.button
            onClick={advance}
            disabled={!canAdvance() || submitting}
            whileTap={{ scale: 0.97 }}
            className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
          >
            {submitting ? "Saving…" : step === TOTAL_STEPS - 1 ? "Save snapshot" : "Continue"}
          </motion.button>
        </div>

      </div>
    </PageShell>
  );
}

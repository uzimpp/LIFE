"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import Link from "next/link";
import { Heart, Target, Flame } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

// ─── Types ────────────────────────────────────────────────────────────────────

type PathDraft = {
  label: string;
  description: string;
  timeline_text: string;
  likeability: number;
  confidence: number;
  excitement: number;
};

const emptyPath = (): PathDraft => ({
  label: "",
  description: "",
  timeline_text: "",
  likeability: 5,
  confidence: 5,
  excitement: 5,
});

const PATH_LABELS = ["A", "B", "C"];

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
            i <= current ? "bg-fg" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  id, label, placeholder, value, onChange, multiline = false,
}: {
  id: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  const base = "w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 transition-colors";
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-fg">{label}</label>
      {multiline
        ? <textarea id={id} rows={3} className={`${base} resize-none`} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} type="text" className={base} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      }
    </div>
  );
}

// ─── Path metadata ────────────────────────────────────────────────────────────

const PATH_META = [
  {
    eyebrow: "Plan A — The path you're on",
    heading: "Your current trajectory.",
    context: "This is what the next five years look like if you keep going as you are. It doesn't have to be perfect — it just has to be honest.",
    labelLabel: "Give this plan a title",
    labelPlaceholder: 'e.g. "The product manager who went indie"',
    descLabel: "What does life look like in five years?",
    descPlaceholder: "Where are you working? What's your role? Where do you live? What does a typical week feel like?",
    timelineLabel: "What are the key moves along the way?",
    timelinePlaceholder: 'e.g. "Year 1: get promoted. Year 3: move cities. Year 5: launch side project."',
  },
  {
    eyebrow: "Plan B — If plan A were gone",
    heading: "What if that door closed?",
    context: "Imagine your current path became unavailable tomorrow. What would you genuinely do instead? Not a small pivot. A real alternative.",
    labelLabel: "Give this plan a title",
    labelPlaceholder: 'e.g. "The teacher who builds curriculum online"',
    descLabel: "What does life look like in five years?",
    descPlaceholder: "What are you doing? What skills does this version of you lean on? What does the work feel like day to day?",
    timelineLabel: "What has to happen in the first two years for this to work?",
    timelinePlaceholder: 'e.g. "Get certified, start freelancing on weekends, go full-time by year 2."',
  },
  {
    eyebrow: "Plan C — The one you're afraid to say",
    heading: "The wild card.",
    context: "If money were not the issue and nobody would judge you — what would you do? This is the plan you've never written down. Write it now.",
    labelLabel: "Give this plan a title",
    labelPlaceholder: 'e.g. "The novelist who moves to Lisbon"',
    descLabel: "What does life look like in five years?",
    descPlaceholder: "Describe it honestly. Where are you? What are you spending your time on? What does it feel like to have chosen this?",
    timelineLabel: "What would have to be true for this to start?",
    timelinePlaceholder: 'e.g. "Save 6 months runway, finish a first draft, find one person doing it already."',
  },
];

// ─── Path form ────────────────────────────────────────────────────────────────

function PathForm({ index, path, onChange }: {
  index: number; path: PathDraft;
  onChange: (field: keyof PathDraft, value: string) => void;
}) {
  const meta = PATH_META[index];
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wide font-medium text-muted mb-3">{meta.eyebrow}</p>
        <h2 className="title text-3xl md:text-4xl text-fg">{meta.heading}</h2>
        <p className="mt-4 text-base md:text-md leading-7 text-muted max-w-lg">{meta.context}</p>
      </div>
      <div className="space-y-5">
        <Field id={`label-${index}`} label={meta.labelLabel} placeholder={meta.labelPlaceholder} value={path.label} onChange={(v) => onChange("label", v)} />
        <Field id={`desc-${index}`} label={meta.descLabel} placeholder={meta.descPlaceholder} value={path.description} onChange={(v) => onChange("description", v)} multiline />
        <Field id={`timeline-${index}`} label={meta.timelineLabel} placeholder={meta.timelinePlaceholder} value={path.timeline_text} onChange={(v) => onChange("timeline_text", v)} multiline />
      </div>
    </div>
  );
}

// ─── Rating sliders ───────────────────────────────────────────────────────────

const RATINGS: { key: keyof PathDraft; label: string; hint: string; icon: React.ReactNode }[] = [
  { key: "likeability", label: "Do you like this life?", hint: "Gut level, not whether it's sensible. 1 = not really, 10 = yes, deeply.", icon: <Heart size={13} strokeWidth={1.5} /> },
  { key: "confidence", label: "Do you have what it takes?", hint: "1 = unlikely, 10 = yes, given time and effort.", icon: <Target size={13} strokeWidth={1.5} /> },
  { key: "excitement", label: "Does it energise you?", hint: "Not satisfaction — genuine aliveness. 1 = flat, 10 = this is it.", icon: <Flame size={13} strokeWidth={1.5} /> },
];

function ReviewStep({ paths, onRate }: {
  paths: PathDraft[];
  onRate: (pathIdx: number, field: keyof PathDraft, value: number) => void;
}) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (el) gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: i * 0.12, ease: "power2.out" });
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="title text-3xl md:text-4xl text-fg">Now feel into each one.</h2>
        <p className="mt-4 text-base md:text-md leading-7 text-muted max-w-lg">
          Three gut-check questions per plan. Don&apos;t optimise — just respond.
        </p>
      </div>
      <div className="space-y-8">
        {paths.map((path, pi) => (
          <div key={pi} ref={(el) => { cardsRef.current[pi] = el; }} className="rounded-[2rem] border border-border p-1.5">
            <div className="rounded-[calc(2rem-0.375rem)] bg-surface px-6 py-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted">Plan {PATH_LABELS[pi]}</p>
                <p className="text-base font-medium text-fg mt-1">{path.label || "(untitled)"}</p>
              </div>
              {RATINGS.map(({ key, label, hint, icon }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-fg">
                        <span className="text-muted">{icon}</span>
                        {label}
                      </p>
                      <p className="text-xs text-muted">{hint}</p>
                    </div>
                    <motion.span key={path[key] as number} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs tabular-nums text-muted ml-4 shrink-0">
                      {path[key]} / 10
                    </motion.span>
                  </div>
                  <input
                    type="range" min={1} max={10} value={path[key] as number}
                    onChange={(e) => onRate(pi, key, Number(e.target.value))}
                    aria-label={label}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer bg-surface-deep [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fg [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;
const PATH_STEPS = 3;

export default function NewOdysseyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paths, setPaths] = useState<PathDraft[]>([emptyPath(), emptyPath(), emptyPath()]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current, { opacity: 0, x: direction * 28 }, { opacity: 1, x: 0, duration: 0.38, ease: "power2.out" });
  }, [step, direction]);

  function updatePath(idx: number, field: keyof PathDraft, value: string | number) {
    setPaths((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  function canAdvance() {
    if (step < PATH_STEPS) {
      const p = paths[step];
      return p.label.trim().length > 0 && p.description.trim().length > 0;
    }
    return true;
  }

  function go(delta: 1 | -1) {
    setDirection(delta);
    gsap.to(containerRef.current, {
      opacity: 0, x: delta * -28, duration: 0.22, ease: "power2.in",
      onComplete: () => setStep((s) => s + delta),
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/v1/odyssey", { paths });
      toast.success("Odyssey plan saved.");
      router.push("/odyssey");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const stepLabels = ["Path one", "Path two", "Path three", "Rate your paths"];

  return (
    <PageShell width="prose">
      <div className="space-y-10 py-16">

        {/* Back link */}
        <Link href="/odyssey" className="text-sm text-muted hover:text-fg transition-colors">
          ← Odyssey plans
        </Link>

        {/* Progress */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide font-medium text-muted">
            Step {Math.min(step + 1, 3)} of 3 — {stepLabels[step]}
          </p>
          <StepBar current={Math.min(step, 2)} total={3} />
        </div>

        {/* Step content */}
        <div ref={containerRef}>
          {step < PATH_STEPS
            ? <PathForm index={step} path={paths[step]} onChange={(field, value) => updatePath(step, field, value)} />
            : <ReviewStep paths={paths} onRate={(pi, field, value) => updatePath(pi, field, value)} />
          }
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-600">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => go(-1)}
            disabled={step === 0}
            className="text-sm text-muted hover:text-fg disabled:opacity-0 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Back
          </button>
          <motion.button
            onClick={step === TOTAL_STEPS - 1 ? handleSubmit : () => go(1)}
            disabled={!canAdvance() || submitting}
            whileTap={{ scale: 0.97 }}
            className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
          >
            {submitting ? "Saving…" : step === TOTAL_STEPS - 1 ? "Save plan" : "Continue"}
          </motion.button>
        </div>

      </div>
    </PageShell>
  );
}

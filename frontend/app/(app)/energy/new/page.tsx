"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageShell } from "@/components/layout/PageShell";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Form state ───────────────────────────────────────────────────────────────

type LogForm = {
  activity: string;
  started_at: string;
  ended_at: string;
  energy_before: number;
  energy_after: number;
  notes: string;
};

function makeDefaultForm(): LogForm {
  const now = new Date();
  const hour = new Date(now);
  hour.setMinutes(0, 0, 0);
  return {
    activity: "",
    started_at: toLocalDatetimeInput(new Date(hour.getTime() - 60 * 60 * 1000)),
    ended_at: toLocalDatetimeInput(hour),
    energy_before: 5,
    energy_after: 5,
    notes: "",
  };
}

// ─── Inline rating slider ─────────────────────────────────────────────────────

function InlineRating({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-fg">{label}</label>
        <motion.span key={value} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="text-xs tabular-nums text-muted">
          {value} / 10
        </motion.span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer bg-surface-deep [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fg [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewEnergyPage() {
  const router = useRouter();
  const [form, setForm] = useState<LogForm>(makeDefaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof LogForm>(key: K, value: LogForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.activity.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/v1/energy", {
        ...form,
        started_at: new Date(form.started_at).toISOString(),
        ended_at: new Date(form.ended_at).toISOString(),
      });
      toast.success("Entry saved.");
      router.push("/energy");
    } catch {
      toast.error("Couldn't save the entry. Try again.");
      setError("Couldn't save the entry. Try again.");
      setSubmitting(false);
    }
  }

  const inputBase = "w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 transition-colors";

  return (
    <PageShell width="prose">
      <div className="space-y-10 py-16">

        <Link href="/energy" className="text-sm text-muted hover:text-fg transition-colors">
          ← Energy log
        </Link>

        <div className="space-y-2">
          <h1 className="title text-5xl md:text-6xl text-fg">Log an activity.</h1>
          <p className="text-base md:text-md leading-7 text-muted">
            Record what you did and how your energy shifted.
          </p>
        </div>

        <div className="space-y-6">

          <div className="space-y-2">
            <label htmlFor="activity" className="text-sm font-medium text-fg">Activity</label>
            <input
              id="activity"
              type="text"
              value={form.activity}
              onChange={(e) => update("activity", e.target.value)}
              placeholder="e.g. Morning run, Deep work, Call with mum"
              className={inputBase}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(["started_at", "ended_at"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <label htmlFor={field} className="text-sm font-medium text-fg">
                  {field === "started_at" ? "Started" : "Ended"}
                </label>
                <input
                  id={field}
                  type="datetime-local"
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className={inputBase}
                />
              </div>
            ))}
          </div>

          <InlineRating label="Energy before" value={form.energy_before} onChange={(v) => update("energy_before", v)} />
          <InlineRating label="Energy after" value={form.energy_after} onChange={(v) => update("energy_after", v)} />

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-fg">
              Notes <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Anything worth remembering"
              className={`${inputBase} resize-none`}
            />
          </div>

        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-600">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-2">
          <Link href="/energy" className="text-sm text-muted hover:text-fg transition-colors cursor-pointer">
            Cancel
          </Link>
          <motion.button
            onClick={handleSubmit}
            disabled={!form.activity.trim() || submitting}
            whileTap={{ scale: 0.97 }}
            className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2"
          >
            {submitting ? "Saving…" : "Save entry"}
          </motion.button>
        </div>

      </div>
    </PageShell>
  );
}

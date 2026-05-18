"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Field, PasswordField } from "../_components/fields";
import { GoogleSection } from "../_components/google-section";

export default function SignInPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    toast.message("Email sign-in is coming soon.", {
      description: "For now, use Continue with Google above.",
    });
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="title mb-10 text-3xl text-fg md:text-4xl">
        Welcome back.
      </h1>

      <GoogleSection />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <PasswordField autoComplete="current-password" showForgot />

        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 cursor-pointer rounded border-border bg-surface accent-fg"
          />
          <span>Keep me signed in</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer rounded-full bg-fg px-8 py-3.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {submitting ? "One moment…" : "Sign in"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="cursor-pointer text-fg underline decoration-border underline-offset-4 transition-colors hover:decoration-fg"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}

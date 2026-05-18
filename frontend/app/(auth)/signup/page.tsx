"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Field, PasswordField } from "../_components/fields";
import { GoogleSection } from "../_components/google-section";

export default function SignUpPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    toast.message("Email sign-up is coming soon.", {
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
        Create an account.
      </h1>

      <GoogleSection />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <Field
            label="First name"
            name="firstName"
            placeholder="Worakrit"
            autoComplete="given-name"
            required
          />
          <Field
            label="Last name"
            name="lastName"
            placeholder="Kullanatpokin"
            autoComplete="family-name"
            required
          />
        </div>

        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <PasswordField autoComplete="new-password" />

        <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-1 h-4 w-4 cursor-pointer rounded border-border bg-surface accent-fg"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/info"
              className="text-fg underline decoration-border underline-offset-4 transition-colors hover:decoration-fg"
            >
              terms
            </Link>{" "}
            of this private tool.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer rounded-full bg-fg px-8 py-3.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {submitting ? "One moment…" : "Create account"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="cursor-pointer text-fg underline decoration-border underline-offset-4 transition-colors hover:decoration-fg"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

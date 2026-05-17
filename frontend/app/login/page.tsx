"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    toast.message("Email sign-in is coming soon.", {
      description: "For now, use Continue with Google below.",
    });
    setSubmitting(false);
  };

  return (
    <main className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
      {/* LEFT — quiet brand panel */}
      <section className="relative hidden lg:flex flex-col justify-between border-r border-border bg-surface-deep px-12 pt-28 pb-12">
        <div className="flex items-start justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="title text-xl text-fg leading-none">LIFE</span>
            <span className="text-[10px] uppercase tracking-[0.32em] text-muted">
              Chapter 00
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-fg transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        <div className="max-w-lg space-y-8">
          <h2 className="title-tight text-fg text-5xl xl:text-6xl leading-[0.94]">
            A private place
            <br />
            <em className="text-fg/80">to think clearly</em>
            <br />
            about a life.
          </h2>
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-border" />
            <p className="text-xs uppercase tracking-[0.32em] text-muted">
              Based on Designing Your Life
            </p>
          </div>
        </div>

        <p className="text-xs text-muted">
          Burnett &amp; Evans · Stanford d.school
        </p>
      </section>

      {/* RIGHT — auth form */}
      <section className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 pt-32 pb-16 lg:pt-28">
        <div className="w-full max-w-md mx-auto">
          {/* Mode toggle */}
          <div className="inline-flex items-center gap-1 mb-10 rounded-full border border-border bg-surface p-1">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  mode === m ? "text-bg" : "text-muted hover:text-fg"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-full bg-fg"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {m === "signin" ? "Sign in" : "Create account"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <header className="mb-10">
                <h1 className="title text-fg text-3xl md:text-4xl">
                  {mode === "signin"
                    ? "Welcome back."
                    : "Create an account."}
                </h1>
                <p className="mt-3 text-sm text-muted">
                  {mode === "signin" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-fg underline underline-offset-4 decoration-border hover:decoration-fg transition-colors cursor-pointer"
                      >
                        Create one
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        className="text-fg underline underline-offset-4 decoration-border hover:decoration-fg transition-colors cursor-pointer"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-5">
                    <Field
                      label="First name"
                      name="firstName"
                      placeholder="Worakrit"
                      autoComplete="given-name"
                    />
                    <Field
                      label="Last name"
                      name="lastName"
                      placeholder="Kullanatpokin"
                      autoComplete="family-name"
                    />
                  </div>
                )}

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <PasswordField
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  showForgot={mode === "signin"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                />

                {mode === "signin" ? (
                  <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-4 w-4 rounded border-border bg-surface accent-fg cursor-pointer"
                    />
                    <span>Keep me signed in</span>
                  </label>
                ) : (
                  <label className="flex items-start gap-2.5 text-sm text-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="terms"
                      required
                      className="mt-1 h-4 w-4 rounded border-border bg-surface accent-fg cursor-pointer"
                    />
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/info"
                        className="text-fg underline underline-offset-4 decoration-border hover:decoration-fg transition-colors"
                      >
                        terms
                      </Link>{" "}
                      of this private tool.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-fg text-bg px-8 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  {submitting
                    ? "One moment…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-[0.32em] text-muted">
                  or {mode === "signin" ? "continue" : "sign up"} with
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <a
                href={`${apiUrl}/v1/auth/google`}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface text-fg px-8 py-3.5 text-sm font-medium hover:bg-surface-deep/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </a>

              <p className="mt-8 text-xs text-muted/80 leading-relaxed">
                We only request your name and email. Sessions live in a
                cookie. Sign out anytime.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.32em] font-medium text-muted mb-3">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-0 border-b border-border focus:border-fg text-fg placeholder:text-muted/40 py-2.5 outline-none transition-colors text-base"
      />
    </label>
  );
}

function PasswordField({
  show,
  onToggle,
  showForgot,
  autoComplete,
}: {
  show: boolean;
  onToggle: () => void;
  showForgot: boolean;
  autoComplete: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.32em] font-medium text-muted">
          Password
        </span>
        {showForgot && (
          <button
            type="button"
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted hover:text-fg transition-colors cursor-pointer"
          >
            Forgot?
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name="password"
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="w-full bg-transparent border-0 border-b border-border focus:border-fg text-fg placeholder:text-muted/40 py-2.5 pr-10 outline-none transition-colors text-base"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-0 bottom-1 text-muted hover:text-fg transition-colors p-2 cursor-pointer"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 4.06-5.06" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

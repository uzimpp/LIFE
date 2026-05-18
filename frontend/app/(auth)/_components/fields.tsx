"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
}: FieldProps) {
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
        required={required}
        className="w-full bg-transparent border-0 border-b border-border focus:border-fg text-fg placeholder:text-muted/40 py-2.5 outline-none transition-colors text-base"
      />
    </label>
  );
}

type PasswordFieldProps = {
  autoComplete: "current-password" | "new-password";
  showForgot?: boolean;
};

export function PasswordField({
  autoComplete,
  showForgot = false,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

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
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-0 bottom-1 text-muted hover:text-fg transition-colors p-2 cursor-pointer"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

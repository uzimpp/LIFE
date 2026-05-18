"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ArrowUpRight, LogOut } from "@/components/ui/icons";
import type { User } from "@/lib/user";

const NAV_LINKS = [
  { label: "Onboarding", href: "/onboarding" },
  { label: "Odyssey", href: "/odyssey" },
  { label: "Energy", href: "/energy" },
];

export function NavbarClient({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          className={`pointer-events-auto flex items-center gap-6 rounded-full border border-border bg-surface/85 backdrop-blur-md transition-all duration-300 ${
            scrolled ? "px-4 py-2 shadow-sm" : "px-5 py-2.5"
          }`}
        >
          <Link href="/" className="title text-lg leading-none text-fg">
            LIFE
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-5">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-muted hover:text-fg transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center">
            {user ? (
              <AvatarMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-fg px-4 py-1.5 text-xs font-medium text-bg transition-opacity hover:opacity-75"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            className="flex md:hidden flex-col justify-center gap-[5px] w-8 h-8"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-px bg-fg transition-transform duration-300 origin-center"
              style={{ transform: open ? "translateY(3px) rotate(45deg)" : "none" }}
            />
            <span
              className="block h-px bg-fg transition-transform duration-300 origin-center"
              style={{ transform: open ? "translateY(-3px) rotate(-45deg)" : "none" }}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-bg/95 flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {user ? (
              <MobileMenu
                user={user}
                onClose={() => setOpen(false)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link
                  href="/login"
                  className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── AvatarMenu — hover/focus dropdown anchored to the avatar pill ──────────
// Opens on hover-in or focus, closes after a brief grace period on hover-out
// so the cursor can travel to the menu. Click toggles, Escape closes, route
// change closes. Outside-click closes via onPointerDown on document.

function AvatarMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on route change — React's "adjust state on prop change" pattern:
  // store the last pathname in state, compare during render, and reset open
  // inline instead of scheduling an extra effect-driven re-render.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // Close on Escape and on outside pointer-down.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await api.post("/v1/auth/logout", {});
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      toast.error("Could not sign out — try again.");
    }
  };

  const initial = user.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name} — account menu`}
        onClick={() => setOpen((v) => !v)}
        className="h-7 w-7 rounded-full bg-surface-deep border border-border flex items-center justify-center text-xs font-medium text-fg hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-pointer"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            className="absolute right-0 top-[calc(100%+0.65rem)] w-64 origin-top-right rounded-2xl border border-border bg-surface/95 backdrop-blur-md shadow-sm overflow-hidden"
          >
            <div className="px-4 py-4 border-b border-border">
              <p className="text-sm font-medium text-fg truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted truncate mt-0.5">
                {user.email}
              </p>
            </div>

            <div className="py-1">
              <Link
                role="menuitem"
                href="/me"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-deep transition-colors"
              >
                <span>Dashboard</span>
                <span className="text-muted group-hover:text-fg transition-colors">
                  <ArrowUpRight size={14} />
                </span>
              </Link>

              <button
                role="menuitem"
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                <span className="text-muted">
                  <LogOut size={14} />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MobileMenu — extracted so the sign-out side-effect logic stays close
// to the desktop version and avoids duplication.

function MobileMenu({ user, onClose }: { user: User; onClose: () => void }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    onClose();
    try {
      await api.post("/v1/auth/logout", {});
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      toast.error("Could not sign out — try again.");
    }
  };

  return (
    <>
      {NAV_LINKS.map(({ label, href }, i) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
        >
          <Link
            href={href}
            className="title text-3xl text-fg"
            onClick={onClose}
          >
            {label}
          </Link>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: NAV_LINKS.length * 0.06, duration: 0.25 }}
      >
        <Link
          href="/me"
          className="title text-3xl text-muted"
          onClick={onClose}
        >
          Dashboard
        </Link>
      </motion.div>
      <motion.button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (NAV_LINKS.length + 1) * 0.06, duration: 0.25 }}
        className="title text-3xl text-muted hover:text-fg transition-colors disabled:opacity-50"
        aria-label={`Sign out of ${user.name}'s account`}
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </motion.button>
    </>
  );
}

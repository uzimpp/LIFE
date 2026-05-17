"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
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
        <nav className={`pointer-events-auto flex items-center gap-6 rounded-full border border-border bg-surface/85 backdrop-blur-md transition-all duration-300 ${scrolled ? "px-4 py-2 shadow-sm" : "px-5 py-2.5"}`}>
          <Link href="/" className="title text-lg leading-none text-fg">
            LIFE
          </Link>

          {/* Desktop links */}
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

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center">
            {user ? (
              <Link
                href="/me"
                aria-label="Dashboard"
                className="h-7 w-7 rounded-full bg-surface-deep border border-border flex items-center justify-center text-xs font-medium text-fg hover:opacity-75 transition-opacity"
              >
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-fg px-4 py-1.5 text-xs font-medium text-bg transition-opacity hover:opacity-75"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Hamburger — mobile */}
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

      {/* Mobile overlay */}
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
              <>
                {NAV_LINKS.map(({ label, href }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                  >
                    <Link href={href} className="title text-3xl text-fg" onClick={() => setOpen(false)}>
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.06, duration: 0.25 }}
                >
                  <Link href="/me" className="title text-3xl text-muted" onClick={() => setOpen(false)}>
                    Me
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/login" className="rounded-full bg-fg px-8 py-3 text-sm font-medium text-bg" onClick={() => setOpen(false)}>
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

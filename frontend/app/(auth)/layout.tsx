import type { CSSProperties } from "react";
import Link from "next/link";
import { CardContent } from "./_components/card-content";

// Pin the auth surface to a fixed dark palette regardless of OS theme.
const darkPalette: CSSProperties = {
  ["--color-bg" as string]: "#141210",
  ["--color-surface" as string]: "#1d1a16",
  ["--color-surface-deep" as string]: "#0d0b09",
  ["--color-fg" as string]: "#f2ead3",
  ["--color-muted" as string]: "#8a7e6e",
  ["--color-border" as string]: "#342e27",
};

const lightCardPalette: CSSProperties = {
  ["--color-bg" as string]: "#f8f1d8",
  ["--color-surface" as string]: "#fefcf6",
  ["--color-surface-deep" as string]: "#d9ccaf",
  ["--color-fg" as string]: "#1a1814",
  ["--color-muted" as string]: "#6e6558",
  ["--color-border" as string]: "#bfb398",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={darkPalette} className="min-h-[100dvh] bg-bg text-fg">
      <div className="mx-auto grid min-h-[100dvh] max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* LEFT — form column */}
        <section className="mx-auto flex w-full max-w-md flex-col px-2 py-6 sm:px-4 sm:py-12">
          <Link href="/" className="mx-auto flex items-baseline gap-3">
            <span className="title text-xl leading-none text-fg">LIFE</span>
          </Link>

          <div className="flex flex-1 flex-col justify-center py-12">
            {children}
          </div>
        </section>

        {/* RIGHT — cream brand card (desktop only, content-sized & centered) */}
        <aside
          style={lightCardPalette}
          className="relative hidden aspect-[5/4] w-full self-center overflow-hidden rounded-[2.5rem] border border-border/60 bg-bg p-10 text-fg shadow-[0_30px_60px_-30px_rgba(20,18,16,0.45)] lg:block xl:p-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-vignette-breath"
            style={{
              background:
                "radial-gradient(120% 80% at 100% 0%, rgba(217,204,175,0.5) 0%, rgba(217,204,175,0) 55%)",
            }}
          />
          <div className="relative h-full w-full">
            <CardContent />
          </div>
        </aside>
      </div>
    </main>
  );
}

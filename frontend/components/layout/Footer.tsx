import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-deep border-t border-border py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="title text-lg text-fg">
            LIFE
          </Link>
          <Link
            href="/info"
            className="text-sm text-muted hover:text-fg transition-colors"
          >
            Info
          </Link>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted">© 2026</p>
        </div>
      </div>
    </footer>
  );
}

import { GoogleIcon } from "./icons";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function GoogleSection() {
  return (
    <>
      <a
        href={`${apiUrl}/v1/auth/google`}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-border bg-surface px-8 py-3.5 text-sm font-medium text-fg transition-colors hover:bg-surface-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <GoogleIcon />
        Continue with Google
      </a>
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-[0.32em] text-muted">
          or with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}

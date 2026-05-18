import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Width = "prose" | "wide" | "dashboard";

const widthClass: Record<Width, string> = {
  prose: "max-w-2xl",
  wide:  "max-w-5xl",
  dashboard: "max-w-6xl",
};

export function PageShell({
  children,
  width = "prose",
  className,
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <main className={cn("min-h-[100dvh] pt-24", className)}>
      <div className={cn(widthClass[width], "mx-auto px-6")}>
        {children}
      </div>
    </main>
  );
}

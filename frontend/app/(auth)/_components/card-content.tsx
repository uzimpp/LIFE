"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { AnimatedHeadline, phrases } from "./animated-headline";
import { IllustrationBadge } from "./illustration-badge";

const PHRASE_INTERVAL_MS = 5800;

export function CardContent() {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, PHRASE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="relative flex h-full w-full items-center">
      <AnimatedHeadline index={index} />
      <div className="pointer-events-none absolute bottom-0 right-0 xl:-bottom-1 xl:-right-1">
        <IllustrationBadge index={index} />
      </div>
    </div>
  );
}

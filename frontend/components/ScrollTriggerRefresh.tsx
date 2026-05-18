"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// On client-side nav, the layout doesn't unmount so ScrollTriggers created
// by the freshly-mounted page never get their positions recomputed against
// the new layout. We re-run on every pathname change: child useEffects fire
// before this parent effect, so by the time we refresh, the new page's
// ScrollTriggers already exist and will recompute correctly. On cold load
// we additionally wait for fonts to settle before the first refresh, since
// next/font swaps after hydration.
export default function ScrollTriggerRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    if (typeof document === "undefined" || !document.fonts) {
      refresh();
      return;
    }
    if (document.fonts.status === "loaded") {
      refresh();
    } else {
      document.fonts.ready.then(refresh);
    }
  }, [pathname]);

  return null;
}

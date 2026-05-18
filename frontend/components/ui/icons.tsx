import type { SVGProps } from "react";

// Minimal editorial icon set. Single source so every surface uses the same
// stroke width and visual weight, and so we can drop the broken
// lucide-react@1.14 dependency from the in-app pages.

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number;
};

function baseProps({
  size = 16,
  strokeWidth = 1.5,
  className,
  ...rest
}: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
    ...rest,
  };
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronUp(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function LogOut(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function Compass(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.4 5-5 2.4 2.4-5 5-2.4Z" />
    </svg>
  );
}

export function Layers(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 18 9 5 9-5" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

// Likeability — a clean outline heart, gentle weight to match the editorial type.
export function Heart(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Confidence — concentric circles, a bullseye drawn at a single stroke weight.
export function Target(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

// Excitement — a single-stroke flame, no inner highlight.
export function Flame(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.85 2.5-2.5 0-1.65-.6-2.5-1.5-3.5-1.66-1.85-2-3.93-2-5.5-3 0-7 4-7 9a7 7 0 0 0 14 0c0-1.21-.34-2.27-.94-3.18-1.18-1.84-2.49-2.4-2.49-2.4S13 11.5 13 13" />
    </svg>
  );
}

// A small editorial chart mark for the energy section.
export function PulseLine(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 12h4l2-6 4 12 2-8 2 4h4" />
    </svg>
  );
}

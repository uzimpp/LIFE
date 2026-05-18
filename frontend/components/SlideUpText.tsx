"use client";

// Per-char slide-up text — same overflow-hidden + yPercent slide pattern
// as LifeWord, but parameterised for arbitrary phrases. paddingBottom +
// negative marginBottom on each wrapper extends the clip-box below the
// baseline so descenders on g/y/p aren't truncated, without affecting the
// surrounding layout.
//
// Chars render with `opacity: 0` inline so they're invisible from first
// paint. The parent component takes ownership in useEffect with
// `gsap.set(chars, { yPercent: 140, opacity: 1 })` — at yPercent: 140
// they're below the overflow-hidden clip box, so still invisible —
// then animates `yPercent` to 0. Hiding via opacity (not transform)
// is important: a render-time inline `transform: translateY(140%)`
// interferes with GSAP's transform tracking and the tween won't reach
// 0 translation at its end state.
export default function SlideUpText({
  text,
  className = "",
  italic = false,
}: {
  text: string;
  className?: string;
  italic?: boolean;
}) {
  const Tag = italic ? "em" : "span";
  return (
    <Tag
      className={`inline-flex flex-wrap align-baseline ${className}`}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="overflow-hidden inline-block align-baseline"
          style={{
            lineHeight: "inherit",
            // Extend the clip-box above the line for serif overshoots /
            // ascenders, and below for descenders. Matching negative
            // margins keep the surrounding layout unchanged so adding
            // headroom doesn't push other elements around.
            paddingTop: "0.35em",
            marginTop: "-0.35em",
            paddingBottom: "0.25em",
            marginBottom: "-0.25em",
          }}
        >
          <span
            className="slide-up-char inline-block"
            style={{
              lineHeight: "inherit",
              opacity: 0,
              willChange: "transform",
            }}
          >
            {char === " " ? " " : char}
          </span>
        </span>
      ))}
    </Tag>
  );
}

"use client";
import React, { useEffect, useState } from "react";

// Animated pipeline illustration to visualize the KB process: Capture → Organize → Enable → Optimize
// Uses SVG with animateMotion for smooth performance; falls back to static when prefers-reduced-motion.
export default function ProcessIllustration() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(!!mq?.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, []);

  return (
    <figure
      aria-label="Knowledge base flow: Capture, Organize, Enable, Optimize"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[--brand-sky]/5 shadow-soft ring-1 ring-[--border-subtle]"
    >
      <div className="pointer-events-none absolute inset-0 -z-0 blur-2xl" aria-hidden>
        <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[--brand-primary]/10" />
      </div>

      <div className="p-4 sm:p-6">
        <svg
          viewBox="0 0 800 180"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
          className="w-full h-[160px] md:h-[180px]"
        >
          <defs>
            <linearGradient id="g-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--brand-sky, #60A5FA)" />
              <stop offset="100%" stopColor="var(--brand-primary, #006BFF)" />
            </linearGradient>
            <linearGradient id="g-node" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-primary, #006BFF)" />
              <stop offset="100%" stopColor="var(--brand-sky, #60A5FA)" />
            </linearGradient>
            <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* Connection line */}
          <path
            d="M80 90 H720"
            stroke="url(#g-line)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />

          {/* Nodes */}
          {[
            { x: 100, label: "Capture" },
            { x: 300, label: "Organize" },
            { x: 500, label: "Enable" },
            { x: 700, label: "Optimize" },
          ].map((n) => (
            <g key={n.label} transform={`translate(${n.x}, 90)`}>
              <circle r="24" fill="url(#g-node)" opacity="0.9" />
              <circle r="28" fill="var(--brand-primary, #006BFF)" opacity="0.07" filter="url(#soft)" />
              <text
                x="0"
                y="42"
                textAnchor="middle"
                fontSize="12"
                fill="#334155"
                fontWeight={600}
              >
                {n.label}
              </text>
            </g>
          ))}

          {/* Flow dots moving along the line */}
          {!reduceMotion ? (
            <g>
              <circle r="6" fill="var(--brand-primary, #006BFF)">
                <animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1">
                  <mpath xlinkHref="#flow" />
                </animateMotion>
              </circle>
              <circle r="5" fill="var(--brand-sky, #60A5FA)" opacity="0.9">
                <animateMotion dur="6s" begin="1s" repeatCount="indefinite">
                  <mpath xlinkHref="#flow" />
                </animateMotion>
              </circle>
              <circle r="4" fill="#0AE8F0" opacity="0.8">
                <animateMotion dur="6s" begin="2s" repeatCount="indefinite">
                  <mpath xlinkHref="#flow" />
                </animateMotion>
              </circle>
              {/* Hidden path definition for motion */}
              <path id="flow" d="M80 90 H720" fill="none" />
            </g>
          ) : (
            <g>
              {/* Static dots */}
              {[160, 360, 560].map((x, i) => (
                <circle key={i} cx={x} cy={90} r={5} fill="var(--brand-primary, #006BFF)" opacity="0.5" />
              ))}
            </g>
          )}

          {/* Arrowheads */}
          {[240, 440, 640].map((x, i) => (
            <g key={i} transform={`translate(${x}, 90)`}>
              <path d="M-12 -6 L0 0 L-12 6" fill="none" stroke="url(#g-line)" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
        </svg>

        <figcaption className="sr-only">
          Animated illustration showing data flowing from Capture to Organize, Enable, and Optimize.
        </figcaption>
      </div>
    </figure>
  );
}
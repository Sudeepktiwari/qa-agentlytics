"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

type Testimonial = {
  name: string;
  role: string;
  inc: string;
  quote: string;
};

export default function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion ?? false;

  const testimonials: Testimonial[] = useMemo(
    () => [
      {
        name: "Priya Sharma",
        role: "Head of Growth, GrowthLabs",
        inc: "+31% demo rate",
        quote:
          "Our inbound conversions doubled within two weeks. AI engages leads faster than SDRs could.",
      },
      {
        name: "Tom Alvarez",
        role: "RevOps, TechFlow",
        inc: "−70% manual sorting",
        quote:
          "The bot qualifies precisely and pushes to HubSpot instantly. SDRs focus on selling, not sifting.",
      },
      {
        name: "Maya Kapoor",
        role: "VP Sales, ScaleUP",
        inc: "+22% close-won",
        quote: "Feels like a 24/7 SDR assistant that never misses a lead.",
      },
    ],
    []
  );

  const logos = useMemo(
    () => [
      { name: "TechFlow", alt: "TechFlow — customer logo" },
      { name: "GrowthLabs", alt: "GrowthLabs — customer logo" },
      { name: "ScaleUP", alt: "ScaleUP — customer logo" },
      { name: "CloudScale", alt: "CloudScale — customer logo" },
    ],
    []
  );

  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-50" as any]: "rgba(0,107,255,0.06)",
    ["--brand-100" as any]: "rgba(0,107,255,0.12)",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
  };

  // animation variants
  const bezierEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.45, ease: bezierEase },
    }),
  };

  return (
    <section
      id="testimonials"
      className="mx-auto max-w-7xl rounded-3xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={brandVars}
      data-testid="testimonials"
      aria-label="Customer testimonials and trust logos"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          What Sales Teams Are Saying
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Teams automate SDR grunt-work and focus on conversations that convert.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={prefersReducedMotion ? undefined : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.18 }}
              variants={cardVariants}
              custom={i}
              className="group relative overflow-hidden rounded-2xl border bg-white p-4 md:p-6 shadow-sm transition hover:shadow-lg"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* subtle hover glow (behind content) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(260px 140px at 20% 0%, var(--brand)22 0%, transparent 70%)`,
                  filter: "blur(14px)",
                }}
              />

              <blockquote className="relative z-10 text-slate-800">
                <div
                  className="flex items-center gap-1 text-amber-500"
                  aria-hidden
                  title="customer rating"
                >
                  <span className="sr-only">5 out of 5 stars</span>
                  {/* accessible star row */}
                  <span aria-hidden>★★★★★</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {t.quote}
                </p>
              </blockquote>

              <figcaption className="relative z-10 mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold"
                    aria-label={`Avatar for ${t.name}`}
                    style={{
                      backgroundColor: "var(--brand-50)",
                      color: "var(--brand)",
                      border: "1px solid var(--brand-100)",
                    }}
                  >
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {t.role}
                    </div>
                  </div>
                </div>

                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    border: "1px solid rgba(16,185,129,0.18)",
                    background: "rgba(16,185,129,0.06)",
                    color: "rgb(4 120 87)",
                  }}
                >
                  {t.inc}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      {/* Trust Logos — marquee that pauses on hover & respects reduced-motion */}
      <div
        className="mx-auto mt-12 max-w-6xl"
        data-testid="trust-logos"
        aria-hidden={reduced}
      >
        <div
          className="relative overflow-hidden rounded-xl"
          // pause marquee on hover: handled with CSS :hover to set animation-play-state
        >
          <div
            className="flex w-max gap-6 py-4"
            // animate with CSS keyframes below; duplicate the set of logos for seamless loop
            style={
              prefersReducedMotion
                ? { animation: "none" }
                : {
                    animation: "marquee 18s linear infinite",
                    WebkitAnimation: "marquee 18s linear infinite",
                  }
            }
          >
            {/* first copy */}
            {logos.map((l) => (
              <div
                key={`a-${l.name}`}
                className="flex items-center justify-center rounded-xl border bg-white p-4"
                style={{ borderColor: "var(--border-subtle)", minWidth: 140 }}
              >
                <svg
                  viewBox="0 0 120 40"
                  className="h-8 w-auto"
                  role="img"
                  aria-label={l.alt}
                >
                  <title>{l.name}</title>
                  <rect
                    x="1"
                    y="6"
                    width="118"
                    height="28"
                    rx="6"
                    fill="#EEF4FF"
                  />
                  <text
                    x="60"
                    y="26"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#3B82F6"
                  >
                    {l.name}
                  </text>
                </svg>
              </div>
            ))}
            {/* duplicated copy */}
            {logos.map((l) => (
              <div
                key={`b-${l.name}`}
                className="flex items-center justify-center rounded-xl border bg-white p-4"
                style={{ borderColor: "var(--border-subtle)", minWidth: 140 }}
              >
                <svg
                  viewBox="0 0 120 40"
                  className="h-8 w-auto"
                  role="img"
                  aria-label={l.alt}
                >
                  <title>{l.name}</title>
                  <rect
                    x="1"
                    y="6"
                    width="118"
                    height="28"
                    rx="6"
                    fill="#EEF4FF"
                  />
                  <text
                    x="60"
                    y="26"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#3B82F6"
                  >
                    {l.name}
                  </text>
                </svg>
              </div>
            ))}
          </div>

          {/* overlay to pause animation on hover (CSS inlined below with style tag) */}
        </div>
      </div>

      {/* Inline small CSS for marquee and hover-pause (kept local to component) */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* pause marquee when hovering the container */
        section#testimonials
          :is(.mx-auto > .relative)
          :is(.flex[style*="animation"]) {
          animation-play-state: running;
        }
        section#testimonials
          :is(.mx-auto > .relative):hover
          .flex[style*="animation"] {
          animation-play-state: paused;
        }

        /* make sure marquee duplicates align */
        @media (max-width: 640px) {
          .mx-auto .flex[style*="animation"] > div {
            min-width: 120px;
          }
        }
      `}</style>
    </section>
  );
}

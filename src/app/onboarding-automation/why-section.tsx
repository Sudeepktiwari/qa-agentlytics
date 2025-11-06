"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const BRAND = "#006BFF";

const problems = [
  "Same flow for everyone, regardless of goals",
  "No in-flow help → tickets spike, time-to-value increases",
  "CSMs repeat the same instructions",
];

const staticList = [
  "One-size-fits-all steps",
  "No help mid-step",
  "Tickets escalate later",
];
const aiList = [
  "Path adapts to role and goal",
  "Explains the ‘why’ at each field",
  "Resolves questions in-flow",
];

export default function WhyOnboardingSection() {
  const prefersReducedMotion = useReducedMotion();

  const sectionVars: React.CSSProperties = {
    ["--brand" as any]: BRAND,
    ["--brand-10" as any]: "rgba(0,107,255,0.06)",
    ["--brand-20" as any]: "rgba(0,107,255,0.12)",
    ["--accent" as any]: "#0ea5ff",
    ["--surface" as any]: "#ffffff",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface-alt" as any]: "rgba(243,246,255,0.8)",
  };

  const listItemVariant = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.06 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={sectionVars}
      aria-label="Why traditional onboarding fails"
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why traditional onboarding fails
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Static steps cause confusion and drop-offs. Users need guidance,
            context, and the ability to ask questions in the moment.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {problems.map((p, i) => (
              <motion.li
                key={p}
                className="flex items-start gap-3"
                initial={prefersReducedMotion ? undefined : "hidden"}
                whileInView={prefersReducedMotion ? undefined : "show"}
                viewport={{ once: true, amount: 0.4 }}
                custom={i}
                variants={listItemVariant as any}
              >
                <span
                  className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                  style={{
                    background: "linear-gradient(180deg,var(--brand), #0047D3)",
                  }}
                  aria-hidden
                >
                  {/* cross icon */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 6l12 12M6 18L18 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{p}</span>
              </motion.li>
            ))}
          </ul>

          {/* small note */}
          <div className="mt-6 text-sm text-slate-500">
            Tip: Personalized, contextual help reduces tickets and shortens
            time-to-value — and your CS team actually enjoys onboarding again.
          </div>
        </div>

        {/* RIGHT - comparison card */}
        <div
          className="relative overflow-hidden rounded-3xl p-4 shadow-xl"
          style={{ background: "var(--surface)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold text-slate-700">Static vs AI-Led</div>

            {/* Visual toggle (static visual only) */}
            <div
              className="flex items-center gap-2 text-xs select-none"
              aria-hidden
            >
              <span className="text-slate-500">Static</span>
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 p-0.5">
                <div
                  className="h-4 w-4 rounded-full bg-white shadow"
                  style={{ transform: "translateX(0.25rem)" }}
                />
              </div>
              <span className="text-slate-900 font-semibold">AI-Led</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* LEFT: static column */}
            <div className="space-y-3">
              {staticList.map((t, i) => (
                <motion.div
                  key={t}
                  className="flex items-start gap-3 text-sm rounded-xl border p-3"
                  initial={
                    prefersReducedMotion ? undefined : { opacity: 0, y: 8 }
                  }
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: i * 0.06, duration: 0.42 }}
                  viewport={{ once: true, amount: 0.4 }}
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--surface-alt)",
                  }}
                >
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200 text-[10px]">
                    –
                  </span>
                  <span className="text-slate-800">{t}</span>
                </motion.div>
              ))}

              {/* drop-off bar */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Completion</span>
                  <span>38%</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-2 rounded"
                    initial={{ width: 0 }}
                    whileInView={{ width: "38%" }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      background: "linear-gradient(90deg,#ff7b9b,#ff5a7a)",
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: AI-led column */}
            <div className="space-y-3">
              {aiList.map((t, i) => (
                <motion.div
                  key={t}
                  className="flex items-start gap-3 text-sm rounded-xl border p-3"
                  initial={
                    prefersReducedMotion ? undefined : { opacity: 0, y: 8 }
                  }
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: i * 0.08, duration: 0.42 }}
                  viewport={{ once: true, amount: 0.4 }}
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "white",
                  }}
                >
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[10px]">
                    ✓
                  </span>
                  <span className="text-slate-800">{t}</span>
                </motion.div>
              ))}

              {/* improvement bar */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Completion</span>
                  <span>81%</span>
                </div>
                <div className="h-2 w-full rounded bg-[--surface-alt] overflow-hidden">
                  <motion.div
                    className="relative h-2 rounded"
                    initial={{ width: 0 }}
                    whileInView={{ width: "81%" }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{
                      background:
                        "linear-gradient(90deg,var(--brand), #0047D3)",
                    }}
                  >
                    <motion.span
                      className="absolute inset-0 block rounded"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated arrows / flow indicators */}
          <div className="pointer-events-none mt-6 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <motion.span
                initial={
                  prefersReducedMotion ? undefined : { x: -6, opacity: 0 }
                }
                whileInView={
                  prefersReducedMotion ? undefined : { x: 0, opacity: 1 }
                }
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                aria-hidden
                className="text-slate-500"
              >
                → Drop-off
              </motion.span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <motion.span
                initial={
                  prefersReducedMotion ? undefined : { x: 6, opacity: 0 }
                }
                whileInView={
                  prefersReducedMotion ? undefined : { x: 0, opacity: 1 }
                }
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                aria-hidden
                className="text-slate-500"
              >
                Guided progress →
              </motion.span>
            </div>
          </div>

          {/* subtle connector SVG to imply left→right transformation */}
          <div className="absolute inset-0 -z-10 hidden lg:block" aria-hidden>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 400"
              fill="none"
              preserveAspectRatio="none"
              className="opacity-30"
            >
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="rgba(0,107,255,0.08)" />
                  <stop offset="1" stopColor="rgba(0,107,255,0.02)" />
                </linearGradient>
              </defs>
              <path
                d="M60 220 C200 150, 600 80, 740 120"
                stroke="url(#g1)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <motion.circle
                cx="740"
                cy="120"
                r="8"
                fill={BRAND}
                animate={
                  prefersReducedMotion
                    ? {}
                    : { scale: [1, 1.6, 1], opacity: [1, 0.6, 1] }
                }
                transition={{
                  repeat: prefersReducedMotion ? 0 : Infinity,
                  duration: 2.2,
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

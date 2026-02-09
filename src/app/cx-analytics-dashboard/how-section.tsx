"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// HowSectionPolished.tsx
// - Fixed layout, removed heavy borders, blue-only palette
// - Timeline (left) and pipeline (right) are responsive and non-overlapping
// - Uses accessible reduced-motion; rolling chips are seeded and safe

const STEPS = [
  { n: "1", t: "Aggregate Data Sources", d: "Chat, email, CSAT, CRM." },
  {
    n: "2",
    t: "Analyze & Classify",
    d: "Sentiment, topic, and agent context.",
  },
  { n: "3", t: "Visualize Trends", d: "Dynamic dashboards for every team." },
  {
    n: "4",
    t: "Recommend Actions",
    d: "Coaching, content, or workflow fixes.",
  },
];

const INGEST = [
  { k: "Billing" },
  { k: "Login" },
  { k: "Refunds" },
  { k: "Integrations" },
  { k: "Shipping" },
];
const CATEGORIES = [
  { k: "Clarify return window in macro" },
  { k: "Add KB: SSO renewal steps" },
  { k: "Nudge: follow‑up empathy phrase" },
];

export default function HowSectionPolished() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const rollingIngest = useMemo(() => {
    const s = INGEST.slice();
    const shift = tick % s.length;
    return [...s.slice(shift), ...s.slice(0, shift)].slice(0, 3);
  }, [tick]);

  const rollingCats = useMemo(() => {
    const s = CATEGORIES.slice();
    const shift = Math.floor(tick / 1) % s.length;
    return [...s.slice(shift), ...s.slice(0, shift)].slice(0, 3);
  }, [tick]);

  return (
    <section
      id="how"
      className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-white to-blue-50 px-4 py-16 sm:px-6 scroll-mt-24"
    >
      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Aggregate, analyze, visualize, and recommend — automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Multi‑channel
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Privacy‑aware
          </span>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
        {/* Left: Animated vertical timeline */}
        <div className="relative">
          {/* vertical line for large screens */}
          <div
            className="hidden lg:block absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-blue-200 to-transparent opacity-60"
            aria-hidden
          />

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="relative pl-16"
              >
                <div className="absolute left-0 top-1 z-10 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 font-bold ring-1 ring-white/60">
                  {s.n}
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-50 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {s.t}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                    </div>
                    <span
                      className="hidden lg:block h-2 w-2 rounded-full bg-blue-600 mt-1"
                      aria-hidden
                    />
                  </div>
                  <div className="mt-3 h-1 w-0 rounded bg-blue-600 transition-all duration-500 group-hover:w-24" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Animated pipeline card */}
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-50/40 to-blue-100/20 blur-lg opacity-80"
            aria-hidden
          />

          <div className="relative overflow-hidden rounded-3xl bg-white p-4 md:p-6 shadow-lg ring-1 ring-blue-50">
            {/* Stage 1: Signals rolling */}
            <div className="min-h-[44px]">
              <AnimatePresence initial={false}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {rollingIngest.map((sig, i) => (
                    <motion.span
                      key={`${sig.k}-${i}-${tick}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.36, ease: "easeOut" }}
                      className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700"
                    >
                      {sig.k}
                    </motion.span>
                  ))}
                </div>
              </AnimatePresence>
            </div>

            {/* Coaching Suggestions */}
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Coaching Suggestions
              </div>
              <div className="mt-1 text-sm text-slate-800">
                Practical hints to improve responses
              </div>

              <motion.div
                layout
                className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]"
                style={{ willChange: "transform" }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {rollingCats.map((a, i) => (
                    <motion.button
                      layout
                      key={`${a.k}-${i}-${tick}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.36, ease: "easeOut" }}
                      className="rounded-full border border-blue-100 bg-white px-3 py-1 font-medium text-blue-700 hover:bg-blue-50"
                    >
                      {a.k}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Progress + donut */}
            <div className="mt-5 grid grid-cols-3 gap-4 items-center">
              <div className="col-span-2">
                <div className="h-2 w-full rounded bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-2 rounded bg-blue-600"
                    initial={{ width: 0 }}
                    animate={
                      reduce
                        ? { width: "80%" }
                        : { width: ["0%", "80%", "70%", "80%"] }
                    }
                    transition={{
                      duration: reduce ? 0 : 2.2,
                      repeat: reduce ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div className="mt-2 text-right text-xs text-slate-500">
                  91% accuracy
                </div>
              </div>

              <div className="grid place-items-center">
                <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#E3EEFF"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-blue-600"
                    strokeDasharray="97.4"
                    strokeDashoffset="97.4"
                    animate={
                      reduce
                        ? { strokeDashoffset: 20 }
                        : { strokeDashoffset: [97.4, 20, 28, 20] }
                    }
                    transition={{
                      duration: reduce ? 0 : 2.2,
                      repeat: reduce ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
                <div className="mt-1 text-[10px] text-slate-500">Find rate</div>
              </div>
            </div>

            {/* CTA row */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-sm font-medium text-slate-800">
                Relevant answers ready
              </div>
              <button className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                Preview results
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

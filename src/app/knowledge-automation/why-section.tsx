import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// WhySection.tsx — cleaner, blue-toned, border-free, and responsive
// - Replaces heavy borders with rings and soft shadows
// - Preserves original copy and metrics
// - Adds accessible reduced-motion handling and consistent spacing

export default function WhySection() {
  const reduce = useReducedMotion();

  const barVariants = {
    hidden: { width: "0%" },
    show: (w: string) => ({ width: w }),
  };

  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        {/* Left copy */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why manual knowledge bases fail
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Static knowledge bases decay without constant tagging and cleanup.
            Duplicates creep in, search is keyword‑only, and agents can’t find
            what already exists.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {[
              "One‑size‑fits‑all tags — no intent understanding",
              "Duplicates & drift across chat, portal, docs",
              "No signal on what’s missing until tickets spike",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Static vs AI‑Led card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-blue-50 p-6 shadow-lg ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">
              Static vs AI‑Led
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Static</span>
              <span className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200/70">
                <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow" />
              </span>
              <span className="font-semibold text-slate-900">AI‑Led</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Static column */}
            <div className="space-y-3 text-sm">
              {["Outdated tags", "Poor discovery", "Repetitive answers"].map(
                (t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-50"
                  >
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[10px] text-rose-600 ring-1 ring-rose-200">
                      –
                    </span>
                    <span className="text-slate-800">{t}</span>
                  </div>
                )
              )}

              {/* animated drop‑off bar */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Answer found</span>
                  <span>55%</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100">
                  <motion.div
                    className="h-2 rounded bg-rose-400"
                    initial={{ width: 0 }}
                    animate={
                      reduce ? { width: "55%" } : { width: ["0%", "55%"] }
                    }
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* AI column */}
            <div className="space-y-3 text-sm">
              {["Auto‑tagged", "Intent‑aware search", "Gap insights"].map(
                (t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-50"
                  >
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                      ✓
                    </span>
                    <span className="text-slate-800">{t}</span>
                  </div>
                )
              )}

              {/* animated improvement bar */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Answer found</span>
                  <span>92%</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-100">
                  <motion.div
                    className="relative h-2 rounded bg-[--brand-primary]"
                    initial={{ width: 0 }}
                    animate={
                      reduce ? { width: "92%" } : { width: ["0%", "92%"] }
                    }
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  >
                    <motion.span
                      className="absolute inset-0 block rounded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none mt-6 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 6, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                →
              </motion.span>
              <span>Missed answers</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span>Precision matches</span>
              <motion.span
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: -6, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                →
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

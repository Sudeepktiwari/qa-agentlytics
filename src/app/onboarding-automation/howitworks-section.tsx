"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const BRAND = "#006BFF";

type Signal = { k: string };
type Action = { txt: string };

export default function HowItWorksFlow() {
  const prefersReducedMotion = useReducedMotion();

  const flowSignals: Signal[] = useMemo(
    () => [
      { k: "Viewed pricing" },
      { k: "High scroll depth" },
      { k: "Opened ROI" },
      { k: "Clicked demo CTA" },
      { k: "Visited enterprise page" },
      { k: "Long idle (60s+)" },
    ],
    []
  );

  const flowActions: Action[] = useMemo(
    () => [
      { txt: "Invite team" },
      { txt: "Set roles" },
      { txt: "Connect Slack" },
      { txt: "Show ROI" },
      { txt: "Book call" },
    ],
    []
  );

  // brand css variables
  const brandVars: React.CSSProperties = {
    ["--brand" as any]: BRAND,
    ["--brand-10" as any]: "rgba(0,107,255,0.06)",
    ["--brand-20" as any]: "rgba(0,107,255,0.12)",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
    ["--surface-alt" as any]: "rgba(243,246,255,0.85)",
  };

  // tick drives which items are shown
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);
  const [paused, setPaused] = useState(false);

  // interval timing
  const ACTION_INTERVAL_MS = prefersReducedMotion ? 6000 : 2500;

  // start interval that increments tick; use functional updates and ref to avoid stale closures
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (prefersReducedMotion) return; // avoid periodic motion if reduced-motion requested

    const id = window.setInterval(() => {
      if (!paused) {
        setTick((t) => t + 1);
      }
    }, ACTION_INTERVAL_MS);

    return () => clearInterval(id);
  }, [ACTION_INTERVAL_MS, paused, prefersReducedMotion]);

  // helpers: get rolling window of N items starting from tick offset (wrap-around)
  const takeWindow = <T,>(arr: T[], start: number, n: number) => {
    const out: T[] = [];
    for (let i = 0; i < n; i++) {
      out.push(arr[(start + i) % arr.length]);
    }
    return out;
  };

  // compute current visible chips/buttons
  const signalWindow = takeWindow(flowSignals, tick % flowSignals.length, 3);
  const actionWindow = takeWindow(flowActions, tick % flowActions.length, 3);

  // motion variants
  const chipVariants = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 8 },
  };

  const btnVariants = {
    initial: { opacity: 0, x: -8, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 8, scale: 0.98 },
  };

  return (
    <section
      id="how"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={brandVars}
      aria-label="How it works"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Detect, guide, assist, and optimize — all automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[--brand-10] px-3 py-1 text-xs font-semibold text-[--brand]">
            Signal-ready
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Privacy-aware
          </span>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
        {/* Steps */}
        <div className="space-y-4">
          {[
            {
              n: "1",
              t: "Detect & Personalize",
              d: "Reads role, plan, and behavior to tailor the path.",
            },
            {
              n: "2",
              t: "Guide & Explain",
              d: "Conversational coaching explains why each step matters.",
            },
            {
              n: "3",
              t: "Assist & Clarify",
              d: "In-flow Q&A resolves blockers instantly.",
            },
            {
              n: "4",
              t: "Track & Optimize",
              d: "Analytics reveal drop-offs; flows improve over time.",
            },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
              className="group relative rounded-2xl border p-5 shadow-sm transition hover:shadow-md"
              style={{
                borderColor: "var(--border-subtle)",
                background: "white",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[--brand-10] text-sm font-bold text-[--brand]">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {s.t}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                </div>
              </div>
              <div className="mt-4 h-1 w-0 rounded bg-[--brand] transition-all duration-500 group-hover:w-24" />
            </motion.div>
          ))}
        </div>

        {/* Animated flow card */}
        <div className="relative">
          <div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-20] to-[--brand-10] blur"
            aria-hidden
          />
          <div
            className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-xl"
            style={{ borderColor: "var(--border-subtle)" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-label="Next best actions and signals"
          >
            {/* Signals row */}
            <div className="min-h-[40px]">
              <AnimatePresence initial={false}>
                <div
                  className="flex flex-wrap items-center gap-2 text-xs"
                  aria-hidden
                >
                  {signalWindow.map((sig, i) => (
                    <motion.span
                      key={`${sig.k}-${i}-${tick}`}
                      variants={chipVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                      style={{
                        borderColor: "rgba(0,107,255,0.18)",
                        background: "rgba(0,107,255,0.06)",
                        color: "rgb(0 63 190)",
                      }}
                    >
                      {sig.k}
                    </motion.span>
                  ))}
                </div>
              </AnimatePresence>
            </div>

            {/* Next Best Actions */}
            <div
              className="mt-4 rounded-2xl border bg-[--surface] p-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="text-[11px] font-semibold text-slate-500">
                Next Best Actions
              </div>
              <div className="mt-1 text-sm text-slate-800">
                Invite team • Set roles • Connect Slack
              </div>

              <motion.div
                layout
                className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]"
                style={{ willChange: "transform" }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {actionWindow.map((a, i) => (
                    <motion.button
                      layout
                      key={`${a.txt}-${i}-${tick}`}
                      variants={btnVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.32, ease: "easeOut" }}
                      className="rounded-full border px-3 py-1 text-[11px] font-medium"
                      style={{
                        borderColor: "rgba(0,107,255,0.18)",
                        background: "white",
                        color: "var(--brand)",
                      }}
                      aria-label={`Action: ${a.txt}`}
                    >
                      {a.txt}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div
              className="mt-5 h-2 w-full rounded bg-[--surface-alt]"
              aria-hidden
            >
              <motion.div
                className="relative h-2 rounded bg-[--brand]"
                initial={{ width: 0 }}
                animate={
                  prefersReducedMotion
                    ? { width: "72%" }
                    : { width: ["0%", "72%", "64%", "72%"] }
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : 2.2,
                  repeat: prefersReducedMotion ? 0 : Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  className="absolute inset-0 block rounded"
                  initial={{ backgroundPosition: "-200% 0" }}
                  animate={
                    prefersReducedMotion
                      ? { backgroundPosition: "0% 0" }
                      : { backgroundPosition: ["-200% 0", "200% 0"] }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0 : 1.8,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                    backgroundSize: "200% 100%",
                    opacity: 0.75,
                  }}
                />
              </motion.div>
            </div>

            <div className="mt-2 text-right text-xs text-slate-500">
              Activation progress ↑
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

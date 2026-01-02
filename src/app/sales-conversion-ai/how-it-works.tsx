"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Step = { n: string; t: string; d: string };

const STEPS: Step[] = [
  {
    n: "1",
    t: "Detect & Trigger",
    d: "Behavior signals detect high-intent visitors in real time.",
  },
  {
    n: "2",
    t: "Engage & Capture",
    d: "AI prompts start personalized conversations and collect lead info.",
  },
  {
    n: "3",
    t: "Qualify & Route",
    d: "Scores leads and sends hot prospects directly to your CRM.",
  },
  {
    n: "4",
    t: "Nurture & Close",
    d: "Automated follow-ups re-engage silent prospects.",
  },
];

export default function HowItWorksSection() {
  // Data that rolls
  const intentsSource = useMemo(
    () => [
      "Viewed Pricing",
      "Opened ROI Sheet",
      "Visited Docs",
      "High Time on Page",
      "Visited Enterprise Page",
      "Clicked Demo CTA",
    ],
    []
  );

  const actionsSource = useMemo(
    () => [
      { txt: "Plan compare" },
      { txt: "ROI sheet" },
      { txt: "Calendar handoff" },
      { txt: "Send proposal" },
      { txt: "Route to SDR" },
    ],
    []
  );

  const prefersReducedMotion = useReducedMotion();

  // rolling arrays and tick (used for keys)
  const [rollingIntents, setRollingIntents] = useState<string[]>(() =>
    intentsSource.slice(0, 3)
  );
  const [rollingActions, setRollingActions] = useState(() =>
    actionsSource.slice(0, 3)
  );
  const [tick, setTick] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const ACTION_INTERVAL = prefersReducedMotion ? 6000 : 2500; // slower if reduced motion on

  useEffect(() => {
    // rotate items periodically (keeps same animation behavior as your provided code)
    if (prefersReducedMotion) {
      intervalRef.current = window.setInterval(() => {
        setTick((t) => t + 1);
        setRollingIntents((arr) => {
          const next = intentsSource[(tick + 3) % intentsSource.length];
          return [...arr.slice(1), next];
        });
        setRollingActions((arr) => {
          const next = actionsSource[(tick + 3) % actionsSource.length];
          return [...arr.slice(1), next];
        });
      }, 8000);
    } else {
      intervalRef.current = window.setInterval(() => {
        setTick((t) => t + 1);
        setRollingIntents((arr) => {
          const next = intentsSource[(tick + 3) % intentsSource.length];
          return [...arr.slice(1), next];
        });
        setRollingActions((arr) => {
          const next = actionsSource[(tick + 3) % actionsSource.length];
          return [...arr.slice(1), next];
        });
      }, ACTION_INTERVAL);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentsSource, actionsSource, prefersReducedMotion]);

  return (
    <section
      id="how"
      className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900">
        How It Works
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Detect, engage, qualify, and route — all automatically.
      </p>

      <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                delay: i * 0.12,
                duration: 0.45,
                ease: "easeOut",
              }}
              className="group relative rounded-2xl border border-[#cfe6ff] bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold"
                  style={{
                    backgroundColor: "rgba(0,107,255,0.08)",
                    color: "#006BFF",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {s.t}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                </div>
              </div>
              <div
                className="mt-4 h-1 w-0 rounded transition-all duration-500 group-hover:w-24"
                style={{ backgroundColor: "#006BFF" }}
              />
            </motion.div>
          ))}
        </div>

        {/* Animated Lead Flow */}
        <div className="relative" aria-label="Lead flow animation">
          <div
            className="absolute -inset-1 rounded-3xl pointer-events-none blur-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,107,255,0.12), rgba(0,107,255,0.04))",
            }}
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-3xl border border-[#e6f3ff] bg-white p-4 md:p-6 shadow-xl">
            <div className="min-h-[40px]">
              <AnimatePresence initial={false} mode="popLayout">
                <div
                  className="flex flex-wrap items-center gap-2 text-xs"
                  aria-hidden
                >
                  {rollingIntents.map((sig, idx) => (
                    <motion.span
                      key={`${sig}-${tick}-${idx}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        border: "1px solid rgba(0,107,255,0.18)",
                        background: "rgba(0,107,255,0.06)",
                        color: "#005ecc",
                      }}
                    >
                      {sig}
                    </motion.span>
                  ))}
                </div>
              </AnimatePresence>
            </div>

            <div className="mt-4 rounded-2xl border border-[#e6f3ff] bg-[--surface] p-4">
              <div className="text-[11px] font-semibold text-slate-500">
                Actions
              </div>
              <div className="mt-1 text-sm text-slate-800">
                Plan compare • ROI sheet • Calendar handoff
              </div>

              <motion.div
                layout
                className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]"
                style={{ willChange: "transform" }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {rollingActions.map((a, idx) => (
                    <motion.button
                      layout
                      key={`${a.txt}-${tick}-${idx}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="rounded-full px-3 py-1 text-[11px] font-medium"
                      style={{
                        border: "1px solid rgba(0,107,255,0.18)",
                        background: "#ffffff",
                        color: "#006BFF",
                      }}
                      aria-label={a.txt}
                    >
                      {a.txt}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            <div
              className="mt-5 h-2 w-full rounded bg-[--surface-alt]"
              aria-hidden
            >
              <motion.div
                className="relative h-2 rounded overflow-hidden"
                initial={{ width: 0 }}
                animate={{
                  width: prefersReducedMotion
                    ? "68%"
                    : ["0%", "68%", "60%", "68%"],
                }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 2.2,
                  repeat: prefersReducedMotion ? 0 : Infinity,
                  ease: "easeInOut",
                }}
                style={{ backgroundColor: "#006BFF" }}
              >
                <motion.span
                  className="absolute inset-0 block rounded"
                  initial={{ backgroundPosition: "-200% 0" }}
                  animate={{
                    backgroundPosition: prefersReducedMotion
                      ? "0% 0"
                      : ["-200% 0", "200% 0"],
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 1.8,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                    backgroundSize: "200% 100%",
                    opacity: 0.7,
                  }}
                />
              </motion.div>
            </div>

            <div className="mt-2 text-right text-xs text-slate-500">
              Conversion likelihood ↑
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

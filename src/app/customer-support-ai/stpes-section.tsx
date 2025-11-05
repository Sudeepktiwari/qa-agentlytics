import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// HowSection.tsx — refined blue-toned theme with graphics
// - Unified blue palette for clean visual hierarchy
// - Minimal icons, soft gradients, no harsh borders

const STEPS = [
  {
    n: "1",
    t: "Detect & Classify",
    d: "Identifies customer mood, intent, and topic across channels.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l2 2" />
      </svg>
    ),
  },
  {
    n: "2",
    t: "Auto‑respond or Route",
    d: "Uses KB, macros, and prior tickets to answer or assign instantly.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 12h18M12 3v18" />
      </svg>
    ),
  },
  {
    n: "3",
    t: "Learn & Suggest",
    d: "Finds gaps, proposes new macros/articles, and improves prompts.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 20a8 8 0 100-16 8 8 0 000 16z" />
        <path d="M12 8v4l2 2" />
      </svg>
    ),
  },
  {
    n: "4",
    t: "Monitor & Optimize",
    d: "Dashboards reveal deflection, sentiment shifts, and backlogs.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 3v18h18" />
        <path d="M7 13l3-3 4 4 5-7" />
      </svg>
    ),
  },
];

const SAMPLE_INTENTS = [
  "Billing",
  "Login",
  "Refund",
  "Feature Request",
  "Password",
  "Shipping",
];
const SAMPLE_ACTIONS = [
  { txt: "Auto-tag: Billing → Refund" },
  { txt: "Route: Auth team" },
  { txt: "Suggest KB: Refund policy" },
  { txt: "Escalate: Priority" },
  { txt: "Create Macro: Cancel flow" },
];

export default function HowSection() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 2100);
    return () => clearInterval(id);
  }, [reduce]);

  const rollingIntents = useMemo(() => {
    const r = SAMPLE_INTENTS.slice();
    const shift = tick % r.length;
    return [...r.slice(shift), ...r.slice(0, shift)].slice(0, 6);
  }, [tick]);

  const rollingActions = useMemo(() => {
    const r = SAMPLE_ACTIONS.slice();
    const shift = tick % r.length;
    return [...r.slice(shift), ...r.slice(0, shift)].slice(0, 4);
  }, [tick]);

  return (
    <section
      id="how"
      className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-white to-slate-50 px-4 py-16 sm:px-6 scroll-mt-24"
      aria-labelledby="how-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2
            id="how-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Resolve smarter in 4 steps
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Detect, respond, learn, and optimize — automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Signal‑ready
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Privacy‑aware
          </span>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
        {/* Left: Blue Stepper */}
        <div className="space-y-5">
          {STEPS.map((s, i) => (
            <motion.article
              key={s.n}
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group relative flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-blue-50 hover:ring-blue-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-100 to-blue-50 text-blue-600 ring-1 ring-white/60">
                <div className="text-sm font-bold">{s.n}</div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-5 h-5 items-center justify-center text-blue-600">
                    {s.icon}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">
                    {s.t}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{s.d}</p>

                <div className="mt-4 h-1 w-0 rounded bg-blue-500/80 transition-all duration-500 group-hover:w-24" />
              </div>
            </motion.article>
          ))}
        </div>

        {/* Right: Blue Illustration */}
        <div className="relative">
          <div
            className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-100/40 to-blue-50 blur-xl opacity-80"
            aria-hidden
          />

          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-blue-50">
            <div className="min-h-[44px]">
              <AnimatePresence initial={false} mode="popLayout">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {rollingIntents.map((k, idx) => (
                    <motion.span
                      key={`${k}-${idx}-${tick}`}
                      initial={
                        reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 6 }}
                      transition={{ duration: 0.32 }}
                      className="rounded-full bg-blue-50 px-3 py-1 text-[13px] font-semibold text-blue-700"
                    >
                      {k}
                    </motion.span>
                  ))}
                </div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 rounded-2xl bg-gradient-to-br from-blue-50 to-white p-4 shadow-inner">
                <div className="text-[11px] font-semibold text-blue-500">
                  Auto‑tagged
                </div>
                <div className="mt-2 text-sm text-slate-800">
                  Billing → Refund • Technical → Login • Product → Feature
                  request
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {rollingActions.map((a, idx) => (
                      <motion.button
                        key={`${a.txt}-${idx}-${tick}`}
                        initial={
                          reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, x: 8 }}
                        transition={{ duration: 0.32 }}
                        className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                      >
                        {a.txt}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Blue tone SVG */}
              <div className="flex-shrink-0">
                <svg
                  width="120"
                  height="86"
                  viewBox="0 0 120 86"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#1E40AF"
                        stopOpacity="0.3"
                      />
                    </linearGradient>
                  </defs>
                  <rect
                    x="6"
                    y="10"
                    width="90"
                    height="50"
                    rx="10"
                    fill="url(#blueGrad)"
                  />
                  <circle cx="20" cy="36" r="6" fill="#3B82F6" opacity="0.8" />
                  <circle cx="60" cy="36" r="6" fill="#1E40AF" opacity="0.8" />
                  <path
                    d="M20 36h40"
                    stroke="#60A5FA"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 66c10-8 30-12 48-10s30 10 48 6"
                    stroke="#93C5FD"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800"
                  style={{ width: "68%" }}
                />
              </div>
              <div className="text-sm text-slate-700 font-semibold">
                Deflection <span className="text-slate-400">33%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

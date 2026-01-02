import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// BrainSection.tsx
// - Polished, responsive, blue-toned
// - Fixes undefined variables (brainPhases, tick), adds accessibility and reduced-motion handling
// - Subtle shadows/rings instead of heavy borders; responsive sizing

const brainPhases = [
  { k: "1", t: "Sentiment Analysis", d: "Measures tone across conversations to flag dips early." },
  { k: "2", t: "Resolution Tracking", d: "Monitors closure rates to highlight blockers and delays." },
  { k: "3", t: "Intent Classification", d: "Groups customer intents for faster routing and answers." },
  { k: "4", t: "CSAT Forecasting", d: "Predicts satisfaction trends to guide proactive fixes." },
  { k: "5", t: "Risk Detection", d: "Identifies churn and escalation risk in real time." },
];

export default function BrainSection() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return; // avoid auto-rotation when user prefers reduced motion
    const id = setInterval(
      () => setTick((t) => (t + 1) % brainPhases.length),
      2400
    );
    return () => clearInterval(id);
  }, [reduce]);

  // rotation animation props (skip if reduced motion)
  const easeLinear: [number, number, number, number] = [0, 0, 1, 1];
  const easeOutBezier: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const rotateProps = reduce
    ? {}
    : {
        initial: { rotate: 0 },
        whileInView: { rotate: 360 },
        whileHover: { rotate: 360 },
        transition: { duration: 8, ease: easeLinear },
      };

  return (
    <section
      id="brain"
      className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24"
    >
      <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
        Inside the Analytics Engine
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Sentiment • Resolution • Intent • CSAT • Risk
      </p>

      <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
        {/* Left cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {brainPhases.map((b, i) => (
            <motion.article
              key={b.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                delay: i * 0.08,
                duration: 0.45,
                ease: easeOutBezier,
              }}
              className="rounded-2xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-slate-50"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                {b.k}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{b.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{b.d}</p>
            </motion.article>
          ))}
        </div>

        {/* Right: Rotating ring + center card */}
        <div className="relative flex items-center justify-center">
          <div className="relative h-72 w-72 sm:h-80 sm:w-80">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 blur-2xl opacity-80"
              aria-hidden
            />

            <motion.div
              className="absolute inset-0"
              {...rotateProps}
              viewport={{ once: true, amount: 0.6 }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <linearGradient
                    id="brainRingGrad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E3EEFF"
                  strokeWidth="1.5"
                />
                <path
                  d="M50 10 A40 40 0 1 1 49.99 10"
                  stroke="url(#brainRingGrad)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              {/* markers around the ring */}
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${angle}deg) translate(34px) rotate(-${angle}deg)`,
                  }}
                  aria-hidden
                >
                  <div className="h-3 w-3 rounded-full bg-blue-600 shadow-md" />
                </div>
              ))}
            </motion.div>

            {/* center cycling card */}
            <div className="absolute inset-0 grid place-items-center">
              <AnimatePresence mode="wait">
                {(() => {
                  const p = brainPhases[tick % brainPhases.length];
                  return (
                    <motion.div
                      key={`${p.k}-${tick}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: easeOutBezier }}
                      className="rounded-2xl bg-white/95 px-5 py-4 text-center shadow-md ring-1 ring-slate-50 w-[72%] sm:w-[64%]"
                    >
                      <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                        {p.k}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {p.t}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600">
                        {p.d}
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

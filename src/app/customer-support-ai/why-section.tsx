import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Enhanced version with softer design, color harmony, and no visible borders
export default function WhySection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<"before" | "after">("after");

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setActive((s) => (s === "before" ? "after" : "before"));
    }, 3000);
    return () => clearInterval(id);
  }, [reduce]);

  const floatIn = {
    hidden: { opacity: 0, y: 8 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
  };

  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24 bg-gradient-to-b from-white to-slate-50 rounded-3xl"
      aria-labelledby="why-heading"
    >
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(0,107,255,0.18); }
          70% { box-shadow: 0 0 25px 8px rgba(0,107,255,0.08); }
          100% { box-shadow: 0 0 0 0 rgba(0,107,255,0); }
        }
        .pulse-glow { animation: pulseGlow 2.4s ease-out infinite; }
      `}</style>

      <div className="grid items-start gap-14 lg:grid-cols-2">
        {/* Text + Feature cards */}
        <div>
          <h2
            id="why-heading"
            className="text-4xl font-bold tracking-tight text-slate-900"
          >
            Why reactive support is failing you
          </h2>
          <p className="mt-4 max-w-xl text-slate-600 leading-relaxed">
            Every unresolved query is a missed opportunity to retain and
            delight. With Advancelytics, your AI agent becomes the first line of
            intelligent help — reducing load and improving CSAT.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-50 text-amber-700 text-base">
                  ⏳
                </span>
                Reactive Support
              </div>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
                <li>Waits for ticket creation</li>
                <li>No context between chats</li>
                <li>Long response cycles</li>
                <li>Agents overwhelmed</li>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 p-5 shadow-lg ring-1 ring-blue-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-100 text-blue-700 text-base">
                  🤖
                </span>
                Advancelytics Support AI
              </div>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-blue-900/80">
                <li>Detects intent & emotion early</li>
                <li>Auto‑suggests personalized solutions</li>
                <li>Summarizes chat context instantly</li>
                <li>Improves CSAT up to 28%</li>
              </ul>
              <div
                className={`pointer-events-none absolute -inset-px rounded-2xl transition ${
                  active === "after" && !reduce ? "pulse-glow" : ""
                }`}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* Animated Illustration */}
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-2xl ring-1 ring-slate-100">
          <div className="mb-5 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Routing &amp; Deflection</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              Live demo
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Before */}
            <motion.div
              className={`rounded-2xl bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm transition duration-500 ${
                active === "before" ? "ring-2 ring-blue-100 scale-[1.02]" : ""
              }`}
              animate={active === "before" ? { scale: 1.02 } : { scale: 1 }}
            >
              <div className="mb-2 font-bold text-slate-800">Before</div>
              {[
                "Manual triage & slow assignment",
                "Agents answer repeat questions",
              ].map((t, i) => (
                <motion.div
                  key={t}
                  className="mt-2 flex items-center gap-2 text-xs text-slate-600"
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={floatIn}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {t}
                </motion.div>
              ))}
            </motion.div>

            {/* After */}
            <motion.div
              className={`relative rounded-2xl bg-gradient-to-b from-blue-50 to-white p-2 pt-4 pl-4 shadow-md transition duration-500 ${
                active === "after" ? "ring-2 ring-blue-200 scale-[1.02]" : ""
              }`}
              animate={active === "after" ? { scale: 1.02 } : { scale: 1 }}
            >
              <div className="mb-2 font-bold text-blue-700">After</div>
              <div className="space-y-3">
                {[
                  { txt: "Auto‑tag: Billing → Refund", to: "Billing queue" },
                  { txt: "Auto‑tag: Technical → Login", to: "Auth queue" },
                  {
                    txt: "Answer: Verified KB — Refund policy",
                    to: "Deflected",
                  },
                ].map((row, i) => (
                  <div
                    key={row.txt}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <motion.span
                      className="rounded-full bg-white/80 px-3 py-2 text-xs md:text-md font-medium text-blue-700 shadow-sm"
                      initial={{ x: 0, opacity: 0 }}
                      animate={{ x: 8, opacity: 1 }}
                      transition={{
                        delay: 0.12 * i,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                    >
                      {row.txt}
                    </motion.span>
                    <span className="text-slate-500">→</span>
                    <motion.span
                      className="rounded-full bg-emerald-50 py-1 font-semibold text-emerald-700"
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.12 * i + 0.08, duration: 0.5 }}
                    >
                      {row.to}
                    </motion.span>
                  </div>
                ))}
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: "72%" }}
                />
              </div>
              <div className="mt-2 text-right text-[11px] text-slate-500">
                Deflection 33% • Correct routing ↑
              </div>

              <svg
                className="pointer-events-none absolute -right-8 -top-8 hidden h-24 w-24 md:block"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#006BFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0AE8F0" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 80 C 40 70, 60 40, 90 30"
                  stroke="url(#g)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M85 28 l8 2 l-5 6"
                  stroke="url(#g)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

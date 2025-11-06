"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const BRAND = "#006BFF";

type BrainPhase = { k: string; t: string; d: string };

const DEFAULT_BRAIN_PHASES: BrainPhase[] = [
  {
    k: "A",
    t: "Predict",
    d: "Identifies signals that indicate purchase intent.",
  },
  {
    k: "B",
    t: "Learn",
    d: "Learns patterns from outcomes to improve predictions.",
  },
  {
    k: "C",
    t: "Personalize",
    d: "Crafts tailored prompts and playbooks for each visitor.",
  },
  { k: "D", t: "Route", d: "Routes hot leads automatically to the right rep." },
];

export default function OnboardingBrainSection({
  brainPhases = DEFAULT_BRAIN_PHASES,
}: {
  brainPhases?: BrainPhase[];
}) {
  const prefersReducedMotion = useReducedMotion();

  // CSS vars
  const cssVars: React.CSSProperties = {
    ["--brand" as any]: BRAND,
    ["--brand-10" as any]: "rgba(0,107,255,0.08)",
    ["--brand-30" as any]: "rgba(0,107,255,0.18)",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
  };

  // center card cycling (tick)
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // cycle center card unless reduced motion or paused
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      if (!paused) setTick((t) => t + 1);
    }, 3200);
    return () => clearInterval(id);
  }, [prefersReducedMotion, paused]);

  // ring spin control: spin once on enter, then allow hover-triggered spins
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hasSpunOnce, setHasSpunOnce] = useState(false);

  useEffect(() => {
    if (!ringRef.current || prefersReducedMotion) return;
    const el = ringRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setHasSpunOnce(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReducedMotion]);

  // animation variants for center card
  const centerVariants = {
    initial: { opacity: 0, scale: 0.96 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  const activePhase = brainPhases[tick % brainPhases.length];

  // helper: node transform
  const nodeTransform = (angleDeg: number, r = 44) =>
    `rotate(${angleDeg}deg) translate(${r}px) rotate(-${angleDeg}deg)`;

  return (
    <section
      id="brain"
      className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6"
      style={cssVars}
      aria-label="Inside the Onboarding Brain"
    >
      <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
        Inside the Onboarding Brain
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Context • Personalization • Adaptive prompts • Optimization
      </p>

      <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
        {/* Left cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {brainPhases.map((b, i) => (
            <motion.div
              key={b.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
              className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="mb-3 grid h-10 w-10 place-items-center rounded-xl text-sm font-bold"
                style={{
                  backgroundColor: "var(--brand-10)",
                  color: "var(--brand)",
                }}
              >
                {b.k}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{b.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{b.d}</p>
            </motion.div>
          ))}
        </div>

        {/* Right: ring + center */}
        <div className="relative flex items-center justify-center">
          <div
            className="relative h-72 w-72 sm:h-80 sm:w-80"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-label="Onboarding brain visual"
          >
            {/* soft glow */}
            <div
              className="absolute inset-0 rounded-full"
              aria-hidden
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0,107,255,0.06), rgba(0,107,255,0.01))",
                filter: "blur(20px)",
              }}
            />

            {/* Ring container (used by IntersectionObserver) */}
            <div ref={ringRef} className="absolute inset-0">
              <motion.div
                initial={{ rotate: 0 }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : hasSpunOnce
                    ? { rotate: 360 } // performs one spin when hasSpunOnce flips true
                    : {}
                }
                whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={
                  prefersReducedMotion ? {} : { duration: 8, ease: "linear" }
                }
                aria-hidden
                style={{ width: "100%", height: "100%" }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full"
                  role="img"
                  aria-label="Adaptive decision ring"
                >
                  <defs>
                    <linearGradient
                      id="brainRingGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={BRAND} stopOpacity="0.6" />
                      <stop
                        offset="100%"
                        stopColor="rgba(0,107,255,0.65)"
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E6F3FF"
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

                {/* nodes */}
                {[0, 90, 180, 270].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: nodeTransform(angle, 44) }}
                  >
                    <div
                      className="h-3 w-3 rounded-full shadow-md"
                      style={{ backgroundColor: "var(--brand)" }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Center cycling card */}
            <div className="absolute inset-0 grid place-items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activePhase.k}-${tick}`}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  variants={centerVariants}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.36,
                    ease: "easeOut",
                  }}
                  className="rounded-2xl border bg-white/95 px-5 py-4 text-center shadow-sm"
                  style={{ borderColor: "var(--border-subtle)" }}
                  aria-live="polite"
                >
                  <div
                    className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: "var(--brand-10)",
                      color: "var(--brand)",
                    }}
                  >
                    {activePhase.k}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {activePhase.t}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600">
                    {activePhase.d}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

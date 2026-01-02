"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type BrainPhase = { k: string; t: string; d: string };

const brandColor = "#006BFF";

const brainPhases: BrainPhase[] = [
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

export default function ProactiveBrainSection() {
  const prefersReducedMotion = useReducedMotion();

  // tick for center card rotation
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  // For one-time spin on enter
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hasSpunOnce, setHasSpunOnce] = useState(false);

  // IntersectionObserver to detect when ring becomes visible
  useEffect(() => {
    if (!ringRef.current || prefersReducedMotion) return;

    const el = ringRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // spin once when first visible
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

  // center card cycling
  useEffect(() => {
    if (prefersReducedMotion) return; // keep static for reduced motion
    const interval = window.setInterval(() => {
      if (!paused) setTick((t) => t + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, [paused, prefersReducedMotion]);

  // helper: compute node transform from angle and radius
  const nodeTransform = (angleDeg: number, r = 44) =>
    `rotate(${angleDeg}deg) translate(${r}px) rotate(-${angleDeg}deg)`;

  const activePhase = brainPhases[tick % brainPhases.length];

  // motion variants
  const centerVariants = {
    initial: { opacity: 0, scale: 0.96 },
    enter: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  return (
    <section
      id="brain"
      className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24"
      style={
        {
          ["--brand" as any]: brandColor,
          ["--brand-accent" as any]: "rgba(0,107,255,0.6)",
        } as React.CSSProperties
      }
    >
      <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
        Inside the Proactive Brain
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Predicts, learns, and personalizes every sales interaction.
      </p>

      <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
        {/* Left Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {brainPhases.map((b, i) => (
            <motion.div
              key={b.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
              className="rounded-2xl border border-slate-100 bg-white p-4 md:p-6 shadow-sm hover:shadow-md"
              style={{ borderColor: "rgba(2,6,23,0.06)" }}
            >
              <div
                className="mb-3 grid h-10 w-10 place-items-center rounded-xl text-sm font-bold"
                style={{
                  backgroundColor: "rgba(0,107,255,0.08)",
                  color: brandColor,
                }}
                aria-hidden
              >
                {b.k}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{b.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{b.d}</p>
            </motion.div>
          ))}
        </div>

        {/* Right: spinning ring + center card */}
        <div className="relative flex items-center justify-center">
          <div
            className="relative h-72 w-72 sm:h-80 sm:w-80 overflow-hidden"
            aria-label="Proactive brain visual"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-full"
              aria-hidden
              style={{
                background:
                  "radial-gradient(closest-side, rgba(0,107,255,0.08), rgba(0,107,255,0.02))",
                filter: "blur(22px)",
              }}
            />

            {/* Ring - spins once on enter, spins on hover */}
            <div ref={ringRef} className="absolute inset-0">
              <motion.div
                initial={{ rotate: 0 }}
                // if reduced motion: no rotate
                animate={
                  prefersReducedMotion
                    ? {}
                    : hasSpunOnce
                    ? { rotate: 360 } // after enter we set hasSpunOnce true which will animate to 360 once
                    : {}
                }
                transition={
                  prefersReducedMotion ? {} : { duration: 8, ease: "linear" } // one full slow spin when hasSpunOnce flips true
                }
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        rotate: 360,
                        transition: { duration: 0.9, ease: "linear" },
                      }
                }
                style={{ width: "100%", height: "100%" }}
                aria-hidden
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full"
                  role="img"
                  aria-label="Animated ring with four nodes"
                >
                  <defs>
                    <linearGradient
                      id="brainRingGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={brandColor}
                        stopOpacity="0.6"
                      />
                      <stop
                        offset="100%"
                        stopColor={"rgba(0,107,255,0.65)"}
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                  </defs>

                  <title>Adaptive decision ring</title>

                  {/* subtle base circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E6F3FF"
                    strokeWidth="1.5"
                  />

                  {/* colored arc */}
                  <path
                    d="M50 10 A40 40 0 1 1 49.99 10"
                    stroke="url(#brainRingGrad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Nodes positioned at 0,90,180,270 */}
                {[0, 90, 180, 270].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: nodeTransform(angle, 44) }}
                    aria-hidden
                  >
                    <div
                      className="h-3 w-3 rounded-full shadow-md"
                      style={{ backgroundColor: brandColor }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Center cycling card */}
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
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
                  className="pointer-events-auto rounded-2xl border bg-white/95 px-5 py-4 text-center shadow-sm"
                  style={{ borderColor: "rgba(2,6,23,0.06)" }}
                  aria-live="polite"
                >
                  <div
                    className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: "rgba(0,107,255,0.08)",
                      color: brandColor,
                    }}
                    aria-hidden
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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ImpactSection — styled like the OutcomesSection you provided,
 * with count-up animation for numbers (respects prefers-reduced-motion).
 */

const BRAND = "#006BFF";

type Metric = { k: string; v: string };

export default function ImpactSection() {
  const prefersReducedMotion = useReducedMotion();

  const metrics: Metric[] = [
    { k: "Activation speed", v: "+65%" },
    { k: "Feature adoption", v: "2.8×" },
    { k: "Onboarding tickets", v: "−42%" },
    { k: "Setup completion", v: "+33%" },
  ];

  const cssVars: React.CSSProperties = {
    ["--brand" as any]: BRAND,
    ["--brand-light" as any]: "rgba(0,107,255,0.08)",
    ["--brand-dark" as any]: "#0050d6",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
  };

  // reusable hook: counts up to numeric part of target (supports %, ×, negative)
  function useCountUp(targetStr: string, active: boolean) {
    const match = targetStr.match(/^([+\-]?[0-9]*\.?[0-9]+)([%×xX]?)$/);
    const targetNum = match ? parseFloat(match[1]) : NaN;
    const suffix = match ? match[2] : "";

    const [display, setDisplay] = useState<string>(targetStr);

    useEffect(() => {
      if (!active || prefersReducedMotion || Number.isNaN(targetNum)) {
        setDisplay(targetStr);
        return;
      }

      let raf = 0;
      const duration = 900;
      const start = performance.now();
      const from = 0;
      const to = targetNum;

      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const curr = from + (to - from) * eased;

        if (
          Math.abs(to) < 1.0 &&
          (suffix === "×" || suffix.toLowerCase() === "x")
        ) {
          setDisplay(`${curr.toFixed(1)}${suffix}`);
        } else if (Math.abs(to) % 1 !== 0) {
          setDisplay(`${curr.toFixed(1)}${suffix}`);
        } else {
          setDisplay(`${Math.round(curr)}${suffix}`);
        }

        if (t < 1) raf = requestAnimationFrame(step);
        else setDisplay(targetStr);
      }

      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [active, targetStr, targetNum, suffix, prefersReducedMotion]);

    return display;
  }

  // IntersectionObserver to activate the count-up when visible
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (prefersReducedMotion) {
      setActive(true);
      return;
    }

    const el = containerRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReducedMotion]);

  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section
      id="impact"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={cssVars}
      aria-label="Real Impact — Faster Activation"
    >
      <div className="text-left">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Real Impact — Faster Activation
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Results measured across customers after adopting conversational
          onboarding.
        </p>
      </div>

      <div
        className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        ref={containerRef}
      >
        {metrics.map((m, i) => {
          const display = useCountUp(m.v, active);

          // color positive vs negative
          // Treat multiplicative gains (e.g., "2.8×" or "2.8x") as positive
          const isTimesGain = /[×xX]/.test(m.v);
          const isPositive =
            m.v.startsWith("+") || m.v.startsWith("↑") || isTimesGain;
          const valueColor = isPositive ? "var(--brand)" : "rgb(220 38 38)";

          return (
            <motion.div
              key={m.k}
              custom={i}
              initial={prefersReducedMotion ? undefined : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.3 }}
              variants={itemVariant as any}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: 1.04,
                      boxShadow: "0 12px 24px rgba(0,107,255,0.12)",
                    }
              }
              className="relative overflow-hidden rounded-2xl border bg-[--surface] p-4 text-center shadow-sm transition-transform"
              style={{
                borderColor: "var(--border-subtle)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,252,255,1) 100%)",
              }}
              role="region"
              aria-label={`${m.k}: ${m.v}`}
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-1 w-full rounded-t-2xl"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand), var(--brand-dark))",
                  opacity: 0.85,
                }}
              />

              <div className="pt-2 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                {m.k}
              </div>

              <div
                className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums"
                style={{ color: valueColor }}
              >
                {display}
              </div>

              <span className="sr-only">{m.v}</span>

              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  background:
                    "radial-gradient(circle at 50% 60%, rgba(0,107,255,0.06), transparent 60%)",
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

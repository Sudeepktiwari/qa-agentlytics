"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function OutcomesSection() {
  const prefersReducedMotion = useReducedMotion();

  const metrics = [
    { k: "Demo bookings", v: "+42%" },
    { k: "Lead quality", v: "+36%" },
    { k: "Response speed", v: "−45%" },
    { k: "Conversion rate", v: "+28%" },
  ];

  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-light" as any]: "rgba(0,107,255,0.08)",
    ["--brand-dark" as any]: "#0050d6",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
  };

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
      id="outcomes"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={brandVars}
      aria-label="Revenue Outcomes"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Real Impact —{" "}
          <span style={{ color: "var(--brand)" }}>Revenue that Speaks</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600 text-sm sm:text-base">
          Performance metrics measured across live deployments.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.k}
            custom={idx}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView={prefersReducedMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariant as any}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { scale: 1.04, boxShadow: "0 12px 24px rgba(0,107,255,0.12)" }
            }
            className="relative overflow-hidden rounded-2xl border bg-[--surface] p-5 text-center shadow-sm transition-transform"
            style={{
              borderColor: "var(--border-subtle)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,252,255,1) 100%)",
            }}
            aria-label={m.k}
          >
            {/* accent stripe */}
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
              className="mt-2 text-2xl font-extrabold tracking-tight"
              style={{
                color:
                  m.v.startsWith("+") || m.v.startsWith("↑")
                    ? "var(--brand)"
                    : "rgb(220 38 38)", // red tone for decrease
              }}
            >
              {m.v}
            </div>

            {/* subtle animated glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                background:
                  "radial-gradient(circle at 50% 60%, rgba(0,107,255,0.08), transparent 60%)",
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function PlanSection() {
  const prefersReducedMotion = useReducedMotion();

  const steps = [
    {
      i: "🔗",
      t: "Connect",
      d: "Drop the snippet and connect tools you already use.",
    },
    {
      i: "👟",
      t: "Guide",
      d: "Conversational flows explain the ‘why’ and coach users inline.",
    },
    {
      i: "🚀",
      t: "Activate",
      d: "Watch activation speed rise and tickets fall.",
    },
  ];

  const itemVariant = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
    }),
  };

  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-10" as any]: "rgba(0,107,255,0.08)",
    ["--brand-20" as any]: "rgba(0,107,255,0.12)",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
  };

  return (
    <section
      id="plan"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={brandVars}
      aria-label="Get started in 3 simple steps"
    >
      <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900">
        Get started in 3 simple steps
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Connect → Guide → Activate
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((s, idx) => (
          <motion.article
            key={s.t}
            custom={idx}
            variants={itemVariant as any}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView={prefersReducedMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border bg-white p-4 md:p-6 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {/* Glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(400px 200px at 50% 0%, rgba(0,107,255,0.06) 0%, transparent 70%)",
              }}
              aria-hidden
            />

            {/* Icon */}
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border text-2xl"
              aria-hidden
              style={{
                color: "var(--brand)",
                background: "var(--brand-10)",
                borderColor: "var(--brand-20)",
              }}
            >
              {s.i}
            </div>

            {/* Title */}
            <h3 className="mt-3 text-base font-semibold text-slate-900">
              {s.t}
            </h3>

            {/* Description */}
            <p className="mt-1 text-sm text-slate-600">{s.d}</p>

            {/* Shimmer line */}
            <motion.span
              className="absolute bottom-4 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded bg-[--brand]"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{
                delay: 0.3 + idx * 0.1,
                duration: 0.6,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

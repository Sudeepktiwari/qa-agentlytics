"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Feature = { i: string; t: string; d: string };

export default function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion();

  const features: Feature[] = useMemo(
    () => [
      {
        i: "🎯",
        t: "Guided Setup Flows",
        d: "Convert static forms into interactive steps.",
      },
      {
        i: "🧩",
        t: "Role-Based Journeys",
        d: "Tailor paths by role, goal, or plan.",
      },
      {
        i: "💬",
        t: "In-Flow Q&A",
        d: "Explain every field and action in plain language.",
      },
      { i: "⚡", t: "Smart Nudges", d: "Detect hesitation and prompt help." },
      {
        i: "📊",
        t: "Progress Analytics",
        d: "Track completion, time-to-value, and drop-offs.",
      },
      {
        i: "🔁",
        t: "Continuous Learning",
        d: "Improve flows using real usage data.",
      },
    ],
    []
  );

  // brand color variable (change here to update all accents)
  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-100" as any]: "rgba(0,107,255,0.08)",
    ["--brand-200" as any]: "rgba(0,107,255,0.18)",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl rounded-3xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={brandVars}
      aria-label="Key features"
    >
      <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900">
        Key Features
      </h2>

      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Purpose-built to guide users to value — faster.
      </p>

      <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, idx) => (
          <motion.article
            key={f.t}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView={prefersReducedMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.18 }}
            custom={idx}
            variants={itemVariant as any}
            className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-transform will-change-transform"
            style={{ borderColor: "var(--border-subtle)" }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.015,
                    boxShadow: "0 12px 30px rgba(0,107,255,0.08)",
                  }
            }
            role="article"
            aria-labelledby={`feature-${idx}-title`}
          >
            {/* Icon chip (SVG circle + emoji for crispness) */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-semibold"
              aria-hidden
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-100), transparent)",
                color: "var(--brand)",
                border: "1px solid var(--brand-200)",
              }}
            >
              <span>{f.i}</span>
            </div>

            <h3
              id={`feature-${idx}-title`}
              className="mt-4 text-base font-semibold text-slate-900"
            >
              {f.t}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.d}</p>

            {/* accent line */}
            <span
              className="absolute bottom-4 left-6 h-0.5 w-10 rounded"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand), rgba(0,80,214,1))",
              }}
              aria-hidden
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

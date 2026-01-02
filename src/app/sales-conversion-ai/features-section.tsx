"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Feature = { i: string; t: string; d: string };

export default function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion();

  const features: Feature[] = useMemo(
    () => [
      {
        i: "⚡",
        t: "Behavioral Triggers",
        d: "Scroll depth, dwell time, and hesitation detection.",
      },
      {
        i: "💬",
        t: "Smart Messaging",
        d: "Adaptive prompts for pricing, ROI, and comparisons.",
      },
      {
        i: "🎯",
        t: "Lead Scoring",
        d: "Automatic prioritization of hot leads.",
      },
      {
        i: "🔗",
        t: "CRM Sync",
        d: "Seamless handoff to HubSpot, Salesforce, and Pipedrive.",
      },
      {
        i: "📊",
        t: "Conversion Analytics",
        d: "Visualize engagement → demo flow in real-time.",
      },
      {
        i: "🤖",
        t: "Automation Sequences",
        d: "Personalized follow-ups and reactivation workflows.",
      },
    ],
    []
  );

  // brand color: #006BFF
  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-100" as any]: "rgba(0,107,255,0.08)",
    ["--brand-200" as any]: "rgba(0,107,255,0.18)",
    ["--brand-dark" as any]: "#0050d6",
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 8 },
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
      aria-label="Key Features"
    >
      <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900">
        Key Features
      </h2>

      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Designed to replicate your best SDR’s instincts — instantly, 24/7.
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
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 md:p-6 shadow-sm transition-transform will-change-transform"
            style={{
              borderColor: "rgba(2,6,23,0.06)",
            }}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    scale: 1.015,
                    boxShadow: "0 10px 30px rgba(3,102,255,0.08)",
                  }
            }
            role="region"
            aria-labelledby={`feature-${idx}-title`}
          >
            {/* Icon chip */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-semibold"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-100), transparent)",
                color: "var(--brand)",
                border: "1px solid var(--brand-200)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
              aria-hidden
            >
              {f.i}
            </div>

            <h3
              id={`feature-${idx}-title`}
              className="mt-4 text-base font-semibold text-slate-900"
            >
              {f.t}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{f.d}</p>

            {/* subtle accent line */}
            <span
              className="absolute bottom-4 left-6 h-0.5 w-10 rounded"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand), var(--brand-dark))",
              }}
              aria-hidden
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

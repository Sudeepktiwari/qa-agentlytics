import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// FeaturesSectionPolished.tsx
// - Blue-only palette, no heavy borders, accessible animations
// - SVG-friendly icons, responsive grid, subtle hover lift

const FEATURES = [
  { icon: <span aria-hidden>📊</span>, title: "Unified Dashboard", desc: "All channels, one analytics view." },
  { icon: <span aria-hidden>🤖</span>, title: "AI‑Scored Chats", desc: "Real‑time quality & empathy evaluation." },
  { icon: <span aria-hidden>🧭</span>, title: "Intent Tracking", desc: "Identify top recurring issues and requests." },
  { icon: <span aria-hidden>🪄</span>, title: "Auto‑Coaching", desc: "Pinpoint skill gaps by conversation type." },
  { icon: <span aria-hidden>💡</span>, title: "VoC Feed", desc: "Extract themes & feature requests." },
  { icon: <span aria-hidden>⚙️</span>, title: "Custom Reports", desc: "Export for leadership, CS, and product teams." },
];

export default function FeaturesSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-white to-blue-50 px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900">
        Key Features
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Unified analytics that coach teams and guide decisions.
      </p>

      <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: i * 0.06 }}
            className="group relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blue-50 hover:shadow-md transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                {f.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 leading-6">
                  {f.desc}
                </p>
              </div>
            </div>

            <div className="mt-4 h-1 w-0 rounded bg-blue-600 transition-all duration-500 group-hover:w-20" />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

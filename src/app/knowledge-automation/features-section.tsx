import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// FeaturesSectionPolished.tsx
// - Blue-only palette, no heavy borders, accessible animations
// - SVG-friendly icons, responsive grid, subtle hover lift

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2v6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 8c0 4.418 3.582 8 8 8s8-3.582 8-8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Auto‑Categorization",
    desc: "Classifies by topic, persona, and product area.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 18a8 8 0 100-16 8 8 0 000 16z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Intent‑Aware Search",
    desc: "Semantic retrieval that matches how users ask.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M3 10h18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Duplicate Detection",
    desc: "Flags overlapping or redundant content.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3v18h18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 3l-6 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Gap Insights",
    desc: "Shows what users search but can’t find.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 12h14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Cross‑Channel Sync",
    desc: "Keep chat and help center consistent.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Native + API Integrations",
    desc: "Zendesk, Intercom, Confluence, Notion, Slack.",
  },
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
        Auto‑organize, enrich, and deliver precise answers — everywhere.
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

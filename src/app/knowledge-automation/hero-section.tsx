import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

// KnowledgeHeroSection.tsx (refined layout + text/options restored to original)
// - Fixed overlap and ensured copy + options match the original snippet
// - Single 'Open Article' CTA in the bar (no 'Share in chat')
// - Chips and ingest/category labels match original values

function CTA({
  href = "#",
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
    </a>
  );
}

export default function KnowledgeHeroSection() {
  const reduce = useReducedMotion();

  // Use tuple-typed cubic-bezier easings to satisfy Framer Motion types
  const easeOutBezier = [0.22, 1, 0.36, 1] as const;
  const easeInOutBezier = [0.42, 0, 0.58, 1] as const;

  const appear: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.42, ease: easeOutBezier },
    }),
  };

  // match original options / labels
  const heroChips = ["Open Article", "Share in Chat", "Create Macro"];
  const ingestSources = [
    { k: "PDFs" },
    { k: "FAQs" },
    { k: "Chat logs" },
    { k: "Zendesk" },
    { k: "Confluence" },
  ];
  const categories = [
    { k: "Security" },
    { k: "Billing" },
    { k: "Setup" },
    { k: "Integrations" },
    { k: "Policies" },
  ];

  return (
    <section className="relative isolate rounded-b-[2rem] bg-gradient-to-b from-white to-blue-50 px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:mx-0 text-slate-900">
            From Chaos to Clarity — Automate Your Knowledge Base
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
            Advancelytics ingests your docs, tags them intelligently, and
            surfaces the right answer across chat, help center, and product —
            automatically.
          </p>

          <div className="mt-8 flex justify-center gap-3 lg:justify-start">
            <CTA href="#how">See How It Works</CTA>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-50 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Request Demo
            </a>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Works with Zendesk • Intercom • Confluence • Notion
          </p>
        </div>

        {/* Right: Chat + Doc sorting mockup */}
        <div className="relative mx-auto w-full max-w-[560px]">
          {/* soft layered glow */}
          <div
            className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-blue-50/60 to-blue-100/25 blur-3xl opacity-80"
            aria-hidden
          />

          {/* mockup card */}
          <div className="relative w-full rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(14,30,60,0.08)]">
            {/* header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 grid place-items-center text-blue-700 font-bold">
                  KB
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Advancelytics
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    Knowledge assistant
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400">Live demo</div>
            </div>

            {/* conversation area - give bottom padding so chips/cta don't overlap */}
            <div className="mt-6 flex flex-col gap-4 pb-4 md:pb-6">
              <motion.div
                initial="hidden"
                animate="show"
                variants={appear}
                custom={0}
                className="flex items-start gap-3"
              >
                <div className="h-9 w-9 rounded-full bg-blue-50 grid place-items-center text-blue-700 font-semibold">
                  U
                </div>
                <div className="rounded-2xl bg-blue-50/60 p-3 text-sm text-slate-800 max-w-[72%]">
                  How do I set up SSO with Okta?
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={appear}
                custom={1}
                className="flex items-start gap-3 ml-12"
              >
                <div className="h-9 w-9 rounded-full bg-white grid place-items-center text-blue-700 font-semibold ring-1 ring-blue-50">
                  AI
                </div>
                <div className="rounded-2xl bg-white p-3 text-sm text-slate-800 shadow-sm max-w-[72%]">
                  I found a verified article in{" "}
                  <span className="font-medium">Security › SSO</span>. Want to
                  open it or share in chat?
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                    {heroChips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-blue-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={appear}
                custom={2}
                className="flex items-start gap-3"
              >
                <div className="h-9 w-9 rounded-full bg-blue-50 grid place-items-center text-blue-700 font-semibold">
                  U
                </div>
                <div
                  className="rounded-2xl bg-blue-50/60 p-3 text-sm text-slate-800 max-w-[72%]"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <span className="sr-only">Agent is typing</span>
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="inline-block h-2 w-2 rounded-full bg-blue-400"
                        animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          delay: d * 0.12,
                          ease: easeInOutBezier,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ingest -> categories visual moved into flow (responsive) */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={appear}
              custom={3}
              className="mt-4"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5 text-[12px]">
                <div className="md:col-span-2 rounded-2xl bg-blue-50 p-3 shadow-inner">
                  <div className="mb-2 font-semibold text-slate-600">
                    Ingest
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingestSources.map((s, i) => (
                      <motion.span
                        key={s.k}
                        className="rounded-md bg-white px-2 py-1 text-slate-700"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.04 }}
                      >
                        {s.k}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex md:items-center md:justify-center text-slate-800 text-2xl">
                  →
                </div>

                <div className="md:col-span-2 rounded-2xl bg-blue-50 p-3 shadow-inner">
                  <div className="mb-2 font-semibold text-slate-600">
                    Categories
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c, i) => (
                      <motion.span
                        key={c.k}
                        className="rounded-md bg-white px-2 py-1 text-blue-700"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.04 }}
                      >
                        {c.k}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA bar moved into normal flow to avoid overlap (single Open Article button to match original) */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={appear}
              custom={4}
              className="mt-4"
            >
              <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-inner">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  Verified answer ready
                </div>
                <button className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  Open Article
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

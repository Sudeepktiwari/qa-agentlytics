import React from "react";

// FeaturesSection.tsx
// - Clean blue-only theme
// - Iconography as inline SVGs (accessible)
// - Soft gradients, subtle hover lift, no heavy borders
// - Responsive grid: 1 / 2 / 3 columns

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    title: "24/7 Self‑Service Layer",
    desc: "Answers routine queries instantly with verified content.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.4-12.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 3l6 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Sentiment Detection",
    desc: "Prioritizes frustrated or at‑risk customers first.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 15v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 10l5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Contextual Search",
    desc: "Pulls from KB, past chats, and macros for precise answers.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M7 11h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "AI Summaries",
    desc: "Generates clean ticket recaps for agents automatically.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M5 12h14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Smart Handoff",
    desc: "Passes full context and transcript to humans when needed.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 3h18v18H3z" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M7 14l3-3 4 4 5-7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Resolution Analytics",
    desc: "Tracks deflection, CSAT, response time, and backlog.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Key Features
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Designed to scale support without losing the human touch.
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Self‑service
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Context‑aware
          </span>
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-tr from-white to-blue-50 p-6 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
          >
            {/* subtle blue glow */}
            <div
              className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(260px 140px at 20% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
              }}
              aria-hidden
            />

            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-100 to-blue-50 text-blue-700">
                {f.icon}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {f.desc}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-5 h-1 w-0 rounded bg-blue-600 transition-all duration-500 group-hover:w-20" />
          </article>
        ))}
      </div>
    </section>
  );
}

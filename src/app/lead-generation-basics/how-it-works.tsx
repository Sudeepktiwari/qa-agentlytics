// components/HowItWorks.jsx
import React from "react";

/**
 * HowItWorks
 * Props:
 *  - brand: { primary: string, accent?: string }
 *    (use CSS vars like 'var(--brand-primary)' or hex values)
 */
export default function HowItWorks({
  brand = { primary: "var(--brand-primary)", accent: "var(--brand-accent)" },
}) {
  const steps = [
    {
      n: "1",
      t: "Detect & Trigger",
      d: "Behavior signals detect high-intent visitors.",
    },
    {
      n: "2",
      t: "Engage & Capture",
      d: "AI prompts start conversations and collect data.",
    },
    {
      n: "3",
      t: "Qualify & Route",
      d: "Lead scoring and routing to the right team instantly.",
    },
    {
      n: "4",
      t: "Nurture & Close",
      d: "Workflows and insights drive conversions.",
    },
  ];

  const signals = ["Scroll 75%", "Dwell 45s", "Exit intent", "Pricing page"];

  return (
    <section
      id="how"
      className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24"
      style={
        {
          "--brand-primary": brand.primary,
          "--brand-accent": brand.accent,
        } as React.CSSProperties
      }
      aria-labelledby="how-heading"
    >
      <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: heading + timeline */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2
                id="how-heading"
                className="text-3xl font-bold tracking-tight text-slate-900"
              >
                How it works
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Detect, engage, qualify, and route — all automatically.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
                Signal-ready
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Privacy-aware
              </span>
            </div>
          </div>

          {/* Timeline / steps */}
          <div className="mt-10">
            <div className="grid gap-4 md:grid-cols-1">
              {steps.map((s, idx) => (
                <article
                  key={s.n}
                  className="relative flex gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Number circle */}
                  <div className="flex-shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-[--brand-primary] bg-[--brand-primary]/10"
                      aria-hidden
                    >
                      {s.n}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">
                      {s.t}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{s.d}</p>

                    {/* underline accent grows on hover */}
                    <div className="mt-3 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-400 group-hover:w-20" />
                  </div>

                  {/* Vertical connector (desktop) */}
                  {idx < steps.length - 1 && (
                    <span
                      className="timeline-connector hidden md:block"
                      aria-hidden
                    />
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Right: product preview card */}
        <div className="w-full max-w-xl">
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-md opacity-60"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
              {/* signals row (animated pulse on active) */}
              <div
                className="flex flex-wrap items-center gap-2 text-xs"
                aria-hidden
              >
                {signals.map((sig, i) => (
                  <div
                    key={sig}
                    className={`rounded-full px-2.5 py-1 text-[--brand-primary] text-xs font-semibold transition-transform duration-300 ${
                      i === 0
                        ? "bg-[--brand-primary]/10 scale-105 shadow-sm"
                        : "bg-[--brand-primary]/5/0/10"
                    }`}
                    style={{
                      backgroundColor:
                        i === 0 ? "var(--brand-primary)/0.08" : "transparent",
                    }}
                  >
                    {sig}
                  </div>
                ))}
              </div>

              {/* AI Prompt */}
              <div className="mt-4 rounded-2xl bg-[--surface] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500">
                    AI Prompt
                  </div>
                  <div className="text-xs text-slate-400">Auto-suggest</div>
                </div>
                <div className="mt-2 text-sm text-slate-800">
                  “Comparing plans? I can estimate your ROI in 30s.”
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "ROI Estimator",
                    "Book 15-min demo",
                    "Send pricing PDF",
                  ].map((cta) => (
                    <button
                      key={cta}
                      className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 text-[--brand-primary] text-xs font-medium hover:bg-[--brand-primary]/5 focus:outline-none focus:ring-2 focus:ring-[--brand-primary]/10"
                    >
                      {cta}
                    </button>
                  ))}
                </div>
              </div>

              {/* capture & route cards */}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600">
                    Lead capture
                  </div>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-800">
                        alex@acme.co
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Company</span>
                      <span className="font-medium text-slate-800">
                        Acme Inc
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Use case</span>
                      <span className="font-medium text-slate-800">
                        Pricing rollout
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600">
                    Score & route
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      Score 86
                    </span>
                    <span className="rounded-full bg-[--brand-primary]/10 px-2.5 py-1 text-[--brand-primary]">
                      AE • West
                    </span>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500">
                    Rules: Pricing intent + Company size (50-250) + ICP match
                  </div>
                </div>
              </div>

              {/* metrics with animated bars */}
              <div className="mt-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { k: "Capture rate", v: 72, color: "bg-emerald-400" },
                    { k: "Qualified", v: 58, color: "bg-amber-400" },
                    { k: "Booked", v: 21, color: "bg-[--brand-primary]" },
                  ].map((m) => (
                    <div key={m.k} className="rounded-lg bg-[--surface] p-3">
                      <div className="text-[11px] text-slate-500">{m.k}</div>
                      <div className="mt-2 text-base font-bold text-slate-800">
                        {m.v}%
                      </div>

                      <div className="mt-2 h-2 w-full rounded bg-slate-100">
                        <div
                          className={`${m.color} h-2 rounded`}
                          style={{
                            width: `${m.v}%`,
                            transition: "width 900ms ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA row */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <a
                  href="#demo"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[--brand-primary]"
                >
                  See the live demo
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <div className="text-xs text-slate-500">
                  No code · Start in minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* scoped styles for timeline connector and reduced motion */}
      <style jsx>{`
        .timeline-connector {
          position: absolute;
          left: 36px; /* aligns under number circle (adjust if number size changes) */
          top: 56px;
          height: 50px;
          width: 1px;
          background: linear-gradient(
            to bottom,
            var(--border-subtle, rgba(0, 0, 0, 0.06)),
            transparent
          );
          border-radius: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .timeline-connector {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}

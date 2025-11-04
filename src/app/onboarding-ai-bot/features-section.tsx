// components/FeaturesSection.jsx
import React from "react";

/**
 * FeaturesSection
 * - Modern, mobile-first, Tailwind-only
 * - Subtle hover glow, improved spacing, accessible markup
 * - "Coming soon" badge shown for the Human Handoff feature
 *
 * Pass brand = { primary: 'var(--brand-primary)' } if you want to use a different color var
 */
export default function FeaturesSection({
  brand = { primary: "var(--brand-primary)" },
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: "🧭",
      title: "Guided Explanations",
      desc: "Inline ‘Why this field?’ clarity for every step with examples.",
    },
    {
      icon: "💬",
      title: "Instant Q&A",
      desc: "Ask anything; get precise, contextual answers from your docs.",
    },
    {
      icon: "✅",
      title: "Real-time Validation",
      desc: "Format checks, connectivity tests, dependency alerts and fixes.",
    },
    {
      icon: "🧠",
      title: "Adaptive Paths",
      desc: "Auto-skip irrelevant steps; insert only what’s needed.",
    },
    {
      icon: "📦",
      title: "Sample Data & Presets",
      desc: "Seed a working setup in seconds with safe defaults.",
    },
    {
      icon: "🤝",
      title: "Human Handoff",
      desc: "Escalate to a human with full context and transcript when needed.",
      comingSoon: true,
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      desc: "See drop-offs, time-to-value, and friction hotspots.",
    },
    {
      icon: "🔗",
      title: "Smart Integrations",
      desc: "Pull config from HubSpot, Salesforce, Slack, Segment and more.",
    },
    {
      icon: "🔒",
      title: "Compliance Ready",
      desc: "PII controls, redact rules, and audit logs for enterprises.",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Key Features
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Designed to move users from “What is this?” to “I’m live.” — with
            fewer tickets.
          </p>
        </div>

        <div className="mt-3 hidden items-center gap-2 md:flex">
          <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
            Inline guidance
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            CRM & Docs aware
          </span>
        </div>
      </div>

      <div className={`mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
        {features.map((f, i) => (
          <article
            key={f.title}
            className={`group relative overflow-hidden rounded-2xl bg-white p-6 transition-shadow duration-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            } hover:shadow-xl`}
            aria-labelledby={`feature-${i}`}
            role="article"
            style={{ willChange: "transform, opacity" }}
          >
            {/* subtle hover glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-60"
              style={{
                background: `radial-gradient(260px 140px at 20% 0%, ${brand.primary}22 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{
                  color: brand.primary,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(250,250,255,0.95))",
                }}
                aria-hidden
              >
                {f.icon}
              </div>

              <div>
                <h3
                  id={`feature-${i}`}
                  className="text-lg font-semibold text-slate-800"
                >
                  {f.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {f.desc}
                </p>

                {/* coming soon badge */}
                {f.comingSoon && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Coming soon
                    </span>
                    <span className="text-xs text-slate-500">
                      Pilot available on request
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* accent underline */}
            <div
              className="relative z-10 mt-5 h-1 w-12 rounded-full opacity-90 transition-all duration-300"
              style={{ background: brand.primary }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

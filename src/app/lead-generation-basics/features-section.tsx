// components/FeaturesLeadSection.jsx
import React from "react";

/**
 * FeaturesLeadSection
 * - Modernized feature tiles, responsive
 * - Soft hover glow, accessible focus ring, mount animation
 * - Pass brand = { primary: string } (CSS var or hex)
 */
export default function FeaturesLeadSection({
  brand = { primary: "var(--brand-primary)" },
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: "⚡",
      title: "Behavioral Triggers",
      desc: "Scroll depth, dwell time, exit intent and more — precisely detected without perf hit.",
    },
    {
      icon: "💬",
      title: "Smart Prompts",
      desc: "Micro-copy tailored to journey stage and intent. Inline chips for one-tap actions.",
    },
    {
      icon: "🎯",
      title: "Lead Scoring",
      desc: "Score high-intent sessions in real time and prioritize handoffs automatically.",
    },
    {
      icon: "🔗",
      title: "CRM Sync",
      desc: "Instant push to HubSpot, Salesforce and more with field mapping and dedupe.",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      desc: "Capture rate, time-to-contact, source mix and drop-offs — all live.",
    },
    {
      icon: "🤖",
      title: "Automation Workflows",
      desc: "Auto-route, nurture sequences, and SLAs with alerts when action is needed.",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      aria-labelledby="features-heading"
    >
      <div className="flex flex-col-reverse gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2
            id="features-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Key Features
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Designed to capture every qualified lead effortlessly.
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
            Signal-driven
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            CRM-ready
          </span>
        </div>
      </div>

      <div
        className={`mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        } transition-all duration-400`}
      >
        {features.map((f, i) => (
          <article
            key={f.title}
            tabIndex={0}
            className="group relative overflow-hidden rounded-2xl bg-white p-4 md:p-6 shadow-sm focus:outline-none focus:ring-4 focus:ring-[--brand-primary]/20 hover:shadow-lg transition transform-gpu"
            style={{ borderRadius: "1rem" }}
            aria-labelledby={`feature-${i}`}
          >
            {/* hover glow (desktop) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-60"
              style={{
                background: `radial-gradient(260px 140px at 20% 0%, ${brand.primary}22 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 flex items-start gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-semibold"
                style={{
                  color: brand.primary,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
                }}
                aria-hidden
              >
                {f.icon}
              </div>

              <div className="min-w-0">
                <h3
                  id={`feature-${i}`}
                  className="text-lg font-semibold text-slate-800"
                >
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {f.desc}
                </p>

                {/* subtle underline that expands on hover/focus */}
                <div className="mt-4 h-1 w-0 rounded-full bg-[--brand-primary] transition-all duration-400 group-hover:w-20 group-focus:w-20" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* accessibility: reduce motion */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .group,
          .group * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
